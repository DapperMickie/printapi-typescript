import { InvalidResponseError } from './errors.js';
import { Checkout, Coupons, Files, Orders, Products, Shipping, Sync } from './resources.js';
import { Transport } from './transport.js';
import type { RequestOptions, TransportOptions } from './transport.js';

export const environments = {
  test: 'https://test.printapi.nl/v2',
  live: 'https://live.printapi.nl/v2',
} as const;
export type Environment = keyof typeof environments;
export type OAuthScope = 'orders:browse' | 'orders:place' | 'orders:track' | 'orders:cancel' | 'products:browse' | 'shipping:quote' | 'coupons:quote' | 'files:upload';
export interface ClientCredentials {
  clientId: string;
  clientSecret: string;
  scopes?: readonly OAuthScope[];
}
/** OAuth token endpoint is not a path in the upstream OpenAPI document. */
export interface OAuthToken {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}
export type ClientOptions = Omit<TransportOptions, 'baseURL'> & {
  /** Defaults to test to prevent accidental fulfillment. */
  environment?: Environment;
  baseURL?: string;
  /** Server-side only by default. Browser opt-in does not make secrets safe to expose. */
  dangerouslyAllowBrowser?: boolean;
} & (
  | { accessToken: string | (() => string | Promise<string>); credentials?: never }
  | { credentials: ClientCredentials; accessToken?: never }
);

export class PrintAPI {
  readonly orders: Orders;
  readonly products: Products;
  readonly checkout: Checkout;
  readonly coupons: Coupons;
  readonly shipping: Shipping;
  readonly sync: Sync;
  readonly files: Files;
  private readonly oauthTransport: Transport;
  private readonly credentials: ClientCredentials | undefined;
  private cachedToken: { value: string; expiresAt: number } | undefined;
  private pendingToken: Promise<string> | undefined;
  constructor(options: ClientOptions) {
    if (typeof window !== 'undefined' && typeof window.document !== 'undefined' && !options.dangerouslyAllowBrowser) {
      throw new TypeError('PrintAPI credentials belong on your server. Browser use requires dangerouslyAllowBrowser: true.');
    }
    const environment = options.environment ?? 'test';
    if (!(environment in environments)) throw new TypeError('Unknown PrintAPI environment');
    if (options.credentials && options.accessToken !== undefined) throw new TypeError('Provide credentials or accessToken, not both');
    if (!options.credentials && (options.accessToken === undefined || options.accessToken === '')) throw new TypeError('Provide credentials or a non-empty accessToken');
    if (options.credentials && (!options.credentials.clientId || !options.credentials.clientSecret)) throw new TypeError('clientId and clientSecret must not be empty');
    this.credentials = options.credentials ? { ...options.credentials, ...(options.credentials.scopes ? { scopes: [...options.credentials.scopes] } : {}) } : undefined;
    const transportOptions = { ...options, baseURL: options.baseURL ?? environments[environment] };
    this.oauthTransport = new Transport(transportOptions);
    const transport = new Transport(transportOptions, async () => {
      if (this.credentials) return this.getAccessToken();
      return typeof options.accessToken === 'function' ? options.accessToken() : options.accessToken!;
    });
    this.orders = new Orders(transport);
    this.products = new Products(transport);
    this.checkout = new Checkout(transport);
    this.coupons = new Coupons(transport);
    this.shipping = new Shipping(transport);
    this.sync = new Sync(transport);
    this.files = new Files(transport);
  }
  /** Explicit OAuth exchange. For normal use pass credentials to the constructor instead. */
  createToken(credentials: ClientCredentials, options?: RequestOptions) {
    if (!credentials.clientId || !credentials.clientSecret) throw new TypeError('clientId and clientSecret must not be empty');
    const body = new URLSearchParams({ grant_type: 'client_credentials', client_id: credentials.clientId, client_secret: credentials.clientSecret });
    if (credentials.scopes?.length) body.set('scope', credentials.scopes.join(' '));
    // Resolve as /v2/oauth?version=2, not /v2/v2/oauth as the relative security-scheme URL could imply.
    return this.oauthTransport.request<OAuthToken>({ method: 'POST', path: '/oauth?version=2', body, contentType: 'application/x-www-form-urlencoded' }, options, false);
  }
  /** Forget the cached OAuth token; no operation is automatically replayed after a 401. */
  clearToken(): void { this.cachedToken = undefined; }
  private getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) return Promise.resolve(this.cachedToken.value);
    if (this.pendingToken) return this.pendingToken;
    // The shared exchange has its own deadline. Cancelling one caller must not abort other callers.
    this.pendingToken = this.createToken(this.credentials!).then(token => {
      if (typeof token?.access_token !== 'string' || !token.access_token) throw new InvalidResponseError('OAuth response has no access_token');
      if (token.token_type !== undefined && (typeof token.token_type !== 'string' || token.token_type.toLowerCase() !== 'bearer')) throw new InvalidResponseError('OAuth response uses an unsupported token_type');
      if (token.expires_in !== undefined && (!Number.isFinite(token.expires_in) || token.expires_in < 0)) throw new InvalidResponseError('OAuth response has an invalid expires_in');
      // Without expiry information, do not guess a token lifetime or cache indefinitely.
      if (token.expires_in !== undefined) {
        const lifetime = token.expires_in * 1000;
        this.cachedToken = { value: token.access_token, expiresAt: Date.now() + lifetime - Math.min(30_000, lifetime * 0.1) };
      }
      return token.access_token;
    }).finally(() => { this.pendingToken = undefined; });
    return this.pendingToken;
  }
}

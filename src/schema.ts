// Generated from openapi/printapi-v2.json. Run npm run generate.
export interface paths {
    "/checkout/{code}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the checkout status of an order. */
        get: operations["GetCheckoutSetup"];
        put?: never;
        /** Set up checkout for an order. */
        post: operations["SetupCheckout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/coupons/quote": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Request a quote for a coupon code. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["CouponIn"];
                    "text/json": components["schemas"]["CouponIn"];
                    "application/xml": components["schemas"]["CouponIn"];
                    "text/xml": components["schemas"]["CouponIn"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CouponQuoteOut"];
                        "text/json": components["schemas"]["CouponQuoteOut"];
                        "application/xml": components["schemas"]["CouponQuoteOut"];
                        "text/xml": components["schemas"]["CouponQuoteOut"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorOut"];
                        "text/json": components["schemas"]["ErrorOut"];
                        "application/xml": components["schemas"]["ErrorOut"];
                        "text/xml": components["schemas"]["ErrorOut"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orders/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a single order by ID. */
        get: operations["GetOrder"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get all orders, sorted newest to oldest. */
        get: {
            parameters: {
                query?: {
                    /** @description The number of orders to skip. */
                    offset?: number | string;
                    /** @description The max number of orders to return. */
                    limit?: number | string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["OrderListOut"];
                        "text/json": components["schemas"]["OrderListOut"];
                        "application/xml": components["schemas"]["OrderListOut"];
                        "text/xml": components["schemas"]["OrderListOut"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorOut"];
                        "text/json": components["schemas"]["ErrorOut"];
                        "application/xml": components["schemas"]["ErrorOut"];
                        "text/xml": components["schemas"]["ErrorOut"];
                    };
                };
            };
        };
        put?: never;
        /** Place an order for one or more products. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /**
             * @description You must include at least one item and a shipping address. Optionally, you can specify your own custom
             *     order ID — Print API will automatically generate a random ID if you don't — plus up to about 1kb of
             *     metadata you'd like to store with your order.
             */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["OrderIn"];
                    "text/json": components["schemas"]["OrderIn"];
                    "application/xml": components["schemas"]["OrderIn"];
                    "text/xml": components["schemas"]["OrderIn"];
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["OrderOut"];
                        "text/json": components["schemas"]["OrderOut"];
                        "application/xml": components["schemas"]["OrderOut"];
                        "text/xml": components["schemas"]["OrderOut"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorOut"];
                        "text/json": components["schemas"]["ErrorOut"];
                        "application/xml": components["schemas"]["ErrorOut"];
                        "text/xml": components["schemas"]["ErrorOut"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orders/{id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get only the status of a single order by ID. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description The order ID. */
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["OrderStatusOut"];
                        "text/json": components["schemas"]["OrderStatusOut"];
                        "application/xml": components["schemas"]["OrderStatusOut"];
                        "text/xml": components["schemas"]["OrderStatusOut"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorOut"];
                        "text/json": components["schemas"]["ErrorOut"];
                        "application/xml": components["schemas"]["ErrorOut"];
                        "text/xml": components["schemas"]["ErrorOut"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/orders/{id}/cancellation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the current cancellation status of an order. */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description The order ID. */
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CancellationStatusOut"];
                        "text/json": components["schemas"]["CancellationStatusOut"];
                        "application/xml": components["schemas"]["CancellationStatusOut"];
                        "text/xml": components["schemas"]["CancellationStatusOut"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorOut"];
                        "text/json": components["schemas"]["ErrorOut"];
                        "application/xml": components["schemas"]["ErrorOut"];
                        "text/xml": components["schemas"]["ErrorOut"];
                    };
                };
            };
        };
        put?: never;
        /**
         * Request cancellation of an order.
         * @description Behaves like cancelling the order from the manage portal. If the order can still be cancelled
         *     it is cancelled immediately; otherwise a cancellation request is recorded and resolved
         *     asynchronously. Orders that have already shipped cannot be cancelled.
         */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    /** @description The order ID. */
                    id: string;
                };
                cookie?: never;
            };
            /** @description The cancellation request model. */
            requestBody?: {
                content: {
                    "application/json": null | components["schemas"]["CancellationRequestIn"];
                    "text/json": null | components["schemas"]["CancellationRequestIn"];
                    "application/xml": null | components["schemas"]["CancellationRequestIn"];
                    "text/xml": null | components["schemas"]["CancellationRequestIn"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["CancellationStatusOut"];
                        "text/json": components["schemas"]["CancellationStatusOut"];
                        "application/xml": components["schemas"]["CancellationStatusOut"];
                        "text/xml": components["schemas"]["CancellationStatusOut"];
                    };
                };
                /** @description Not Found */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorOut"];
                        "text/json": components["schemas"]["ErrorOut"];
                        "application/xml": components["schemas"]["ErrorOut"];
                        "text/xml": components["schemas"]["ErrorOut"];
                    };
                };
                /** @description Conflict */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorOut"];
                        "text/json": components["schemas"]["ErrorOut"];
                        "application/xml": components["schemas"]["ErrorOut"];
                        "text/xml": components["schemas"]["ErrorOut"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/products": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get all products, sorted by name (A-Z). */
        get: {
            parameters: {
                query?: {
                    /** @description The number of products to skip. */
                    offset?: number | string;
                    /** @description The max number of products to return. */
                    limit?: number | string;
                    /**
                     * @description Return the full product, as returned by `GET /products/{id}`, for every entry. A lower max number of
                     *     products applies.
                     */
                    includeDetails?: boolean;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK. With `includeDetails=true`, every entry is the full product as returned by `GET /products/{id}`. */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ProductListOut"] | components["schemas"]["ProductWithDetailsListOut"];
                        "text/json": components["schemas"]["ProductListOut"] | components["schemas"]["ProductWithDetailsListOut"];
                        "application/xml": components["schemas"]["ProductListOut"] | components["schemas"]["ProductWithDetailsListOut"];
                        "text/xml": components["schemas"]["ProductListOut"] | components["schemas"]["ProductWithDetailsListOut"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorOut"];
                        "text/json": components["schemas"]["ErrorOut"];
                        "application/xml": components["schemas"]["ErrorOut"];
                        "text/xml": components["schemas"]["ErrorOut"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/products/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a single product by ID. */
        get: operations["GetProduct"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/shipping/quote": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Request a shipping costs quote. */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            /** @description Must contain the shipment info, including at least one item and a country. */
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ShipmentIn"];
                    "text/json": components["schemas"]["ShipmentIn"];
                    "application/xml": components["schemas"]["ShipmentIn"];
                    "text/xml": components["schemas"]["ShipmentIn"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ShippingQuoteOut"];
                        "text/json": components["schemas"]["ShippingQuoteOut"];
                        "application/xml": components["schemas"]["ShippingQuoteOut"];
                        "text/xml": components["schemas"]["ShippingQuoteOut"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorOut"];
                        "text/json": components["schemas"]["ErrorOut"];
                        "application/xml": components["schemas"]["ErrorOut"];
                        "text/xml": components["schemas"]["ErrorOut"];
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sync/statuses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get all status updates since a specific date/time. */
        get: {
            parameters: {
                query?: {
                    /** @description The start date/time, inclusive. Max. 7 days ago. */
                    since?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["OrderStatusUpdateListOut"];
                        "text/json": components["schemas"]["OrderStatusUpdateListOut"];
                        "application/xml": components["schemas"]["OrderStatusUpdateListOut"];
                        "text/xml": components["schemas"]["OrderStatusUpdateListOut"];
                    };
                };
                /** @description Bad Request */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ErrorOut"];
                        "text/json": components["schemas"]["ErrorOut"];
                        "application/xml": components["schemas"]["ErrorOut"];
                        "text/xml": components["schemas"]["ErrorOut"];
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/files/{code}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Upload a print file for an order. */
        post: operations["Upload"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** in:Address */
        AddressIn: {
            /** String */
            company?: null | string;
            /** String */
            name: null | string;
            /** String */
            line1: null | string;
            /** String */
            line2?: null | string;
            /** String */
            postCode: null | string;
            /** String */
            city: null | string;
            /** String */
            state?: null | string;
            country: components["schemas"]["Country"];
            /** String */
            phone?: null | string;
        };
        /** out:Address */
        AddressOut: {
            /** String */
            company?: null | string;
            /** String */
            name: string;
            /** String */
            line1: string;
            /** String */
            line2?: null | string;
            /** String */
            postCode: string;
            /** String */
            city: string;
            /** String */
            state?: null | string;
            country?: components["schemas"]["Country"];
            /** String */
            phone?: null | string;
        };
        /** in:Billing */
        BillingIn: {
            address?: null | components["schemas"]["AddressIn"];
        };
        /** out:Billing */
        BillingOut: {
            address?: null | components["schemas"]["AddressOut"];
        };
        /** CancellationRequestBM */
        CancellationRequestIn: {
            /** String */
            reason?: null | string;
        };
        /**
         * CancellationStatus
         * @enum {string}
         */
        CancellationStatus: "None" | "Requested" | "Accepted" | "Failed";
        /** out:CancellationStatus */
        CancellationStatusOut: {
            status?: components["schemas"]["CancellationStatus"];
            /** String */
            reason?: null | string;
        };
        /** in:CheckoutSetup */
        CheckoutIn: {
            /** String */
            returnUrl: string;
            billing?: null | components["schemas"]["BillingIn"];
            billingAddress?: null | components["schemas"]["AddressIn"];
        };
        /** out:Checkout */
        CheckoutOut: {
            /**
             * Decimal
             * Format: double
             */
            amount?: number | string;
            status?: components["schemas"]["PaymentStatus"];
            /** String */
            paymentUrl: string;
            /** String */
            returnUrl: string;
            billing: components["schemas"]["BillingOut"];
            /**
             * Nullable`1
             * Format: double
             */
            tax?: null | number | string;
        };
        /**
         * Country
         * @enum {string}
         */
        Country: "AF" | "AX" | "AL" | "DZ" | "AS" | "AD" | "AO" | "AI" | "AQ" | "AG" | "AR" | "AM" | "AW" | "AU" | "AT" | "AZ" | "BS" | "BH" | "BD" | "BB" | "BY" | "BE" | "BZ" | "BJ" | "BM" | "BT" | "BO" | "BQ" | "BA" | "BW" | "BV" | "BR" | "IO" | "BN" | "BG" | "BF" | "BI" | "KH" | "CM" | "CA" | "CV" | "KY" | "CF" | "TD" | "CL" | "CN" | "CX" | "CC" | "CO" | "KM" | "CG" | "CD" | "CK" | "CR" | "CI" | "HR" | "CW" | "CY" | "CZ" | "DK" | "DJ" | "DM" | "DO" | "EC" | "EG" | "SV" | "GQ" | "ER" | "EE" | "ET" | "FK" | "FO" | "FJ" | "FI" | "FR" | "GF" | "PF" | "TF" | "GA" | "GM" | "GE" | "DE" | "GH" | "GI" | "GR" | "GL" | "GD" | "GP" | "GU" | "GT" | "GG" | "GN" | "GW" | "GY" | "HT" | "HM" | "VA" | "HN" | "HK" | "HU" | "IS" | "IN" | "ID" | "IQ" | "IE" | "IM" | "IL" | "IT" | "JM" | "JP" | "JE" | "JO" | "KZ" | "KE" | "KI" | "KR" | "KW" | "KG" | "LA" | "LV" | "LB" | "LS" | "LR" | "LY" | "LI" | "LT" | "LU" | "MO" | "MK" | "MG" | "MW" | "MY" | "MV" | "ML" | "MT" | "MH" | "MQ" | "MR" | "MU" | "YT" | "MX" | "FM" | "MD" | "MC" | "MN" | "ME" | "MS" | "MA" | "MZ" | "MM" | "NA" | "NR" | "NP" | "NL" | "AN" | "NC" | "NZ" | "NI" | "NE" | "NG" | "NU" | "NF" | "MP" | "NO" | "OM" | "PK" | "PW" | "PS" | "PA" | "PG" | "PY" | "PE" | "PH" | "PN" | "PL" | "PT" | "PR" | "QA" | "RE" | "RO" | "RU" | "RW" | "BL" | "SH" | "KN" | "LC" | "MF" | "PM" | "VC" | "WS" | "SM" | "ST" | "SA" | "SN" | "RS" | "SC" | "SL" | "SG" | "SX" | "SK" | "SI" | "SB" | "SO" | "ZA" | "GS" | "SS" | "ES" | "LK" | "SR" | "SJ" | "SZ" | "SE" | "CH" | "TW" | "TJ" | "TZ" | "TH" | "TL" | "TG" | "TK" | "TO" | "TT" | "TN" | "TR" | "TM" | "TC" | "TV" | "UG" | "UA" | "AE" | "GB" | "US" | "UM" | "UY" | "UZ" | "VU" | "VE" | "VN" | "VG" | "VI" | "WF" | "EH" | "YE" | "ZM" | "ZW" | "IC" | "EA";
        /** in:Coupon */
        CouponIn: {
            /** String */
            code: string;
            /**
             * Nullable`1
             * Format: double
             */
            productsAmount?: null | number | string;
            /**
             * Nullable`1
             * Format: double
             */
            shippingAmount?: null | number | string;
        };
        /** out:Coupon.Quote */
        CouponQuoteOut: {
            expirationDateTime?: components["schemas"]["FixedFormatDateTime"];
            state?: components["schemas"]["CouponState"];
            type?: components["schemas"]["CouponType"];
            scope?: components["schemas"]["CouponScope"];
            /**
             * Nullable`1
             * Format: int32
             */
            percentage?: null | number | string;
            /**
             * Nullable`1
             * Format: double
             */
            amount?: null | number | string;
            /**
             * Nullable`1
             * Format: double
             */
            calculated?: null | number | string;
        };
        /**
         * CouponScope
         * @enum {string}
         */
        CouponScope: "Products" | "Total";
        /**
         * CouponState
         * @enum {string}
         */
        CouponState: "Invalid" | "Expired" | "Valid";
        /**
         * CouponType
         * @enum {string}
         */
        CouponType: "Amount" | "Percentage";
        /** Field */
        ErrorFieldOut: {
            /** String */
            key: string;
            /** String[] */
            errors: string[];
        };
        /** Error */
        ErrorOut: {
            /** String */
            message: string;
            /** String */
            hint: string;
            /** String */
            url?: null | string;
            /** ErrorFieldVM[] */
            fields?: null | components["schemas"]["ErrorFieldOut"][];
        };
        /**
         * FileStatus
         * @enum {string}
         */
        FileStatus: "Cancelled" | "DownloadFailed" | "PaymentRequired" | "DownloadRetryPending" | "DownloadPending" | "DownloadInProgress" | "AwaitingUpload" | "UploadInProgress" | "Accepted";
        /**
         * FileType
         * @enum {string}
         */
        FileType: "Unknown" | "PDF" | "JPEG" | "PNG";
        /**
         * FixedFormatDateTime
         * Format: date-time
         */
        FixedFormatDateTime: string;
        /** out:InvoiceEntry */
        InvoiceEntryOut: {
            /**
             * Decimal
             * Format: double
             */
            cost?: number | string;
            /** InvoiceEntryTaxVM[] */
            taxes: components["schemas"]["InvoiceEntryTaxOut"][];
        };
        /** out:InvoiceEntryTax */
        InvoiceEntryTaxOut: {
            /**
             * Decimal
             * Format: double
             */
            rate?: number | string;
            /**
             * Decimal
             * Format: double
             */
            amount?: number | string;
            /**
             * Nullable`1
             * Format: double
             */
            calculatedOver?: null | number | string;
        };
        /** out:Invoice */
        InvoiceOut: {
            production: components["schemas"]["InvoiceEntryOut"];
            shipping: components["schemas"]["InvoiceEntryOut"];
            handling: components["schemas"]["InvoiceEntryOut"];
            discount: components["schemas"]["InvoiceEntryOut"];
            total: components["schemas"]["InvoiceEntryOut"];
        };
        /**
         * InvoicingState
         * @enum {string}
         */
        InvoicingState: "Included" | "Excluded";
        /** in:Order */
        OrderIn: {
            /** String */
            id?: null | string;
            /** String */
            email?: null | string;
            /** String */
            username?: null | string;
            productionSpeed?: components["schemas"]["ProductionSpeed"];
            /** OrderItemBM[] */
            items: null | components["schemas"]["OrderItemIn"][];
            shipping?: null | components["schemas"]["ShippingIn"];
            /** String */
            coupon?: null | string;
            /** String */
            metadata?: null | string;
            shippingAddress?: null | components["schemas"]["AddressIn"];
        };
        /** out:File */
        OrderItemFileListEntryOut: {
            status?: components["schemas"]["FileStatus"];
            /** String */
            downloadUrl?: null | string;
            /** String */
            uploadUrl?: null | string;
        };
        /** in:Files */
        OrderItemFileListIn: {
            /** String */
            content?: null | string;
            /** String */
            cover?: null | string;
            /** String */
            output?: null | string;
            /** String */
            outputType?: null | string;
            /** String */
            snapshotId?: null | string;
        };
        /** out:Files */
        OrderItemFileListOut: {
            content: components["schemas"]["OrderItemFileListEntryOut"];
            cover?: null | components["schemas"]["OrderItemFileListEntryOut"];
        };
        /** in:Item */
        OrderItemIn: {
            /** String */
            id?: null | string;
            /** String */
            productId: string;
            /** String */
            title?: null | string;
            /**
             * Nullable`1
             * Format: int32
             */
            pageCount?: null | number | string;
            /**
             * Int32
             * Format: int32
             */
            quantity?: number | string;
            files?: null | components["schemas"]["OrderItemFileListIn"];
            /** OrderItemOptionBM[] */
            options?: null | components["schemas"]["OrderItemOptionIn"][];
            /**
             * Nullable`1
             * Format: double
             */
            retail?: null | number | string;
            /**
             * Nullable`1
             * Format: double
             */
            retailPrice?: null | number | string;
            /** String */
            metadata?: null | string;
        };
        /** in:Option */
        OrderItemOptionIn: {
            /** String */
            id: string;
            /** String */
            value: string;
        };
        /** out:Option */
        OrderItemOptionOut: {
            /** String */
            id: string;
            /** String */
            value: string;
            /** String */
            name: string;
        };
        /** out:Item */
        OrderItemOut: {
            /** String */
            id: string;
            /** String */
            productId: string;
            /** String */
            title?: null | string;
            /**
             * Int32
             * Format: int32
             */
            pageCount?: number | string;
            /**
             * Int32
             * Format: int32
             */
            quantity?: number | string;
            /**
             * Nullable`1
             * Format: double
             */
            retail?: null | number | string;
            files: components["schemas"]["OrderItemFileListOut"];
            /** OrderItemOptionVM[] */
            options: components["schemas"]["OrderItemOptionOut"][];
            /** String */
            metadata?: null | string;
        };
        /** out:OrderSummary */
        OrderListEntryOut: {
            /** String */
            id: string;
            dateTime?: components["schemas"]["FixedFormatDateTime"];
            /** String */
            email?: null | string;
            /** String */
            username?: null | string;
            status?: components["schemas"]["OrderStatus"];
            /** String */
            url: string;
        };
        /** out:Orders */
        OrderListOut: {
            /**
             * Int32
             * Format: int32
             */
            count?: number | string;
            /**
             * Int32
             * Format: int32
             */
            offset?: number | string;
            /**
             * Int32
             * Format: int32
             */
            limit?: number | string;
            /** OrderListEntryVM[] */
            results: components["schemas"]["OrderListEntryOut"][];
        };
        /** out:Order */
        OrderOut: {
            /** String */
            id: string;
            dateTime: components["schemas"]["FixedFormatDateTime"];
            status: components["schemas"]["OrderStatus"];
            /** String */
            trackingUrl?: null | string;
            /** String */
            email?: null | string;
            /** String */
            username?: null | string;
            productionSpeed: components["schemas"]["ProductionSpeed"];
            checkout?: null | components["schemas"]["CheckoutOut"];
            /** OrderItemVM[] */
            items: components["schemas"]["OrderItemOut"][];
            /** String */
            metadata?: null | string;
            shipping: components["schemas"]["ShippingOut"];
            invoice: components["schemas"]["InvoiceOut"];
            invoicingState: components["schemas"]["InvoicingState"];
        };
        /**
         * OrderStatus
         * @enum {string}
         */
        OrderStatus: "Created" | "Processing" | "Shipped" | "Cancelled";
        /** out:Status */
        OrderStatusOut: {
            order?: components["schemas"]["OrderStatus"];
            payment?: null | components["schemas"]["PaymentStatus"];
        };
        /** out:StatusUpdate */
        OrderStatusUpdateListEntryOut: {
            /** String */
            id: string;
            status?: components["schemas"]["OrderStatus"];
            dateTime?: components["schemas"]["FixedFormatDateTime"];
        };
        /** out:StatusUpdates */
        OrderStatusUpdateListOut: {
            since?: components["schemas"]["FixedFormatDateTime"];
            /** OrderStatusUpdateListEntryVM[] */
            results: components["schemas"]["OrderStatusUpdateListEntryOut"][];
        };
        /**
         * PaymentStatus
         * @enum {string}
         */
        PaymentStatus: "Open" | "Failed" | "Successful" | "Cancelled";
        /** out:Price */
        PriceOut: {
            /**
             * Decimal
             * Format: double
             */
            base?: number | string;
            /**
             * Decimal
             * Format: double
             */
            perExtraPage?: number | string;
        };
        /** out:ProductFile */
        ProductFileOut: {
            /** String */
            id: string;
            /**
             * Decimal
             * Format: double
             */
            height?: number | string;
            /**
             * Decimal
             * Format: double
             */
            width?: number | string;
            /**
             * Decimal
             * Format: double
             */
            bleed?: number | string;
            /** FileType[] */
            accepts?: components["schemas"]["FileType"][];
        };
        /**
         * ProductionSpeed
         * @enum {string}
         */
        ProductionSpeed: "Standard" | "Express";
        /** out:ProductionTime */
        ProductionTimeOut: {
            speed?: components["schemas"]["ProductionSpeed"];
            /**
             * Int32
             * Format: int32
             */
            days?: number | string;
            /**
             * Int32
             * Format: int32
             */
            limitHour?: number | string;
        };
        /** out:ProductSummary */
        ProductListEntryOut: {
            /** String */
            id: string;
            /** String */
            name: string;
            /** String */
            url: string;
        };
        /** out:Products */
        ProductListOut: {
            /**
             * Int32
             * Format: int32
             */
            count?: number | string;
            /**
             * Int32
             * Format: int32
             */
            offset?: number | string;
            /**
             * Int32
             * Format: int32
             */
            limit?: number | string;
            /** ProductListEntryVM[] */
            results: components["schemas"]["ProductListEntryOut"][];
        };
        /** out:ProductOptionChoice */
        ProductOptionChoiceOut: {
            /** String */
            value: string;
            /** String */
            name: string;
            cost: components["schemas"]["PriceOut"];
            checkout?: null | components["schemas"]["PriceOut"];
        };
        /** out:ProductOption */
        ProductOptionOut: {
            /** String */
            id: string;
            /** String */
            default: string;
            /** String */
            label: string;
            /** ProductOptionChoiceVM[] */
            choices?: components["schemas"]["ProductOptionChoiceOut"][];
        };
        /** out:Product */
        ProductOut: {
            /** String */
            id: string;
            /** String */
            name: string;
            /** String */
            category: string;
            /**
             * Decimal
             * Format: double
             */
            taxRate?: number | string;
            cost: components["schemas"]["PriceOut"];
            checkout?: null | components["schemas"]["PriceOut"];
            /**
             * Int32
             * Format: int32
             */
            minQuantity?: number | string;
            /**
             * Int32
             * Format: int32
             */
            maxQuantity?: number | string;
            /** Boolean */
            hasVariablePageCount?: boolean;
            /**
             * Nullable`1
             * Format: int32
             */
            fixedPageCount?: null | number | string;
            /**
             * Int32
             * Format: int32
             */
            minPageCount?: number | string;
            /**
             * Int32
             * Format: int32
             */
            maxPageCount?: number | string;
            /**
             * Nullable`1
             * Format: int32
             */
            pageCountIncrement?: null | number | string;
            /**
             * Nullable`1
             * Format: double
             */
            paperThickness?: null | number | string;
            /** ProductOptionVM[] */
            options?: null | components["schemas"]["ProductOptionOut"][];
            /** ProductFileVM[] */
            files?: null | components["schemas"]["ProductFileOut"][];
            /**
             * Nullable`1
             * Format: int32
             */
            productionTimeInDays?: null | number | string;
            /** ProductionTimeVM[] */
            productionTimes?: null | components["schemas"]["ProductionTimeOut"][];
            /** QuantityDiscountVM[] */
            quantityDiscounts?: null | components["schemas"]["QuantityDiscountOut"][];
        };
        /** out:ProductsWithDetails */
        ProductWithDetailsListOut: {
            /**
             * Int32
             * Format: int32
             */
            count?: number | string;
            /**
             * Int32
             * Format: int32
             */
            offset?: number | string;
            /**
             * Int32
             * Format: int32
             */
            limit?: number | string;
            /** ProductVM[] */
            results: {
                /** String */
                id: string;
                /** String */
                name: string;
                /** String */
                category: string;
                /**
                 * Decimal
                 * Format: double
                 */
                taxRate?: number | string;
                /** out:Price */
                cost: {
                    /**
                     * Decimal
                     * Format: double
                     */
                    base?: number | string;
                    /**
                     * Decimal
                     * Format: double
                     */
                    perExtraPage?: number | string;
                };
                /** out:Price */
                checkout?: {
                    /**
                     * Decimal
                     * Format: double
                     */
                    base?: number | string;
                    /**
                     * Decimal
                     * Format: double
                     */
                    perExtraPage?: number | string;
                };
                /**
                 * Int32
                 * Format: int32
                 */
                minQuantity?: number | string;
                /**
                 * Int32
                 * Format: int32
                 */
                maxQuantity?: number | string;
                /** Boolean */
                hasVariablePageCount?: boolean;
                /**
                 * Nullable`1
                 * Format: int32
                 */
                fixedPageCount?: null | number | string;
                /**
                 * Int32
                 * Format: int32
                 */
                minPageCount?: number | string;
                /**
                 * Int32
                 * Format: int32
                 */
                maxPageCount?: number | string;
                /**
                 * Nullable`1
                 * Format: int32
                 */
                pageCountIncrement?: null | number | string;
                /**
                 * Nullable`1
                 * Format: double
                 */
                paperThickness?: null | number | string;
                /** ProductOptionVM[] */
                options?: null | {
                    /** String */
                    id: string;
                    /** String */
                    default: string;
                    /** String */
                    label: string;
                    /** ProductOptionChoiceVM[] */
                    choices?: {
                        /** String */
                        value: string;
                        /** String */
                        name: string;
                        /** out:Price */
                        cost: {
                            /**
                             * Decimal
                             * Format: double
                             */
                            base?: number | string;
                            /**
                             * Decimal
                             * Format: double
                             */
                            perExtraPage?: number | string;
                        };
                        /** out:Price */
                        checkout?: {
                            /**
                             * Decimal
                             * Format: double
                             */
                            base?: number | string;
                            /**
                             * Decimal
                             * Format: double
                             */
                            perExtraPage?: number | string;
                        };
                    }[];
                }[];
                /** ProductFileVM[] */
                files?: null | {
                    /** String */
                    id: string;
                    /**
                     * Decimal
                     * Format: double
                     */
                    height?: number | string;
                    /**
                     * Decimal
                     * Format: double
                     */
                    width?: number | string;
                    /**
                     * Decimal
                     * Format: double
                     */
                    bleed?: number | string;
                    /** FileType[] */
                    accepts?: ("Unknown" | "PDF" | "JPEG" | "PNG")[];
                }[];
                /**
                 * Nullable`1
                 * Format: int32
                 */
                productionTimeInDays?: null | number | string;
                /** ProductionTimeVM[] */
                productionTimes?: null | {
                    /**
                     * ProductionSpeed
                     * @enum {string}
                     */
                    speed?: "Standard" | "Express";
                    /**
                     * Int32
                     * Format: int32
                     */
                    days?: number | string;
                    /**
                     * Int32
                     * Format: int32
                     */
                    limitHour?: number | string;
                }[];
                /** QuantityDiscountVM[] */
                quantityDiscounts?: null | {
                    /**
                     * Int32
                     * Format: int32
                     */
                    quantity?: number | string;
                    /**
                     * Decimal
                     * Format: double
                     */
                    percentage?: number | string;
                }[];
            }[];
        };
        /** out:QuantityDiscount */
        QuantityDiscountOut: {
            /**
             * Int32
             * Format: int32
             */
            quantity?: number | string;
            /**
             * Decimal
             * Format: double
             */
            percentage?: number | string;
        };
        /** in:Shipment */
        ShipmentIn: {
            /** String */
            state?: null | string;
            country: components["schemas"]["Country"];
            preference?: components["schemas"]["ShippingPreference"];
            /** ShipmentItemBM[] */
            items?: components["schemas"]["ShipmentItemIn"][];
        };
        /** in:Shipment.Item */
        ShipmentItemIn: {
            /** String */
            productId: null | string;
            /**
             * Nullable`1
             * Format: int32
             */
            pageCount?: null | number | string;
            /**
             * Int32
             * Format: int32
             */
            quantity?: number | string;
        };
        /** in:Shipping */
        ShippingIn: {
            preference?: components["schemas"]["ShippingPreference"];
            address?: null | components["schemas"]["AddressIn"];
        };
        /** out:ShippingMethod */
        ShippingMethodOut: {
            /** String */
            name: string;
            /** Boolean */
            isTrackable?: boolean;
        };
        /** out:Shipping */
        ShippingOut: {
            method: components["schemas"]["ShippingMethodOut"];
            address: components["schemas"]["AddressOut"];
        };
        /**
         * ShippingPreference
         * @enum {string}
         */
        ShippingPreference: "Auto" | "Tracked";
        /** out:Shipping.Quote */
        ShippingQuoteOut: {
            /**
             * Decimal
             * Format: double
             */
            shipping?: number | string;
            /**
             * Decimal
             * Format: double
             */
            handling?: number | string;
            /**
             * Decimal
             * Format: double
             */
            taxRate?: number | string;
            /**
             * Decimal
             * Format: double
             */
            payment?: number | string;
            method: components["schemas"]["ShippingMethodOut"];
        };
        /** UploadResult */
        UploadResultOut: {
            /** String */
            fileName: string;
            fileType?: components["schemas"]["FileType"];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    GetCheckoutSetup: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique checkout code. */
                code: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CheckoutOut"];
                    "text/json": components["schemas"]["CheckoutOut"];
                    "application/xml": components["schemas"]["CheckoutOut"];
                    "text/xml": components["schemas"]["CheckoutOut"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                    "text/json": components["schemas"]["ErrorOut"];
                    "application/xml": components["schemas"]["ErrorOut"];
                    "text/xml": components["schemas"]["ErrorOut"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                    "text/json": components["schemas"]["ErrorOut"];
                    "application/xml": components["schemas"]["ErrorOut"];
                    "text/xml": components["schemas"]["ErrorOut"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                    "text/json": components["schemas"]["ErrorOut"];
                    "application/xml": components["schemas"]["ErrorOut"];
                    "text/xml": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    SetupCheckout: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description A unique checkout code. */
                code: string;
            };
            cookie?: never;
        };
        /** @description Information for the Print API checkout service. */
        requestBody?: {
            content: {
                "application/json": null | components["schemas"]["CheckoutIn"];
                "text/json": null | components["schemas"]["CheckoutIn"];
                "application/xml": null | components["schemas"]["CheckoutIn"];
                "text/xml": null | components["schemas"]["CheckoutIn"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CheckoutOut"];
                    "text/json": components["schemas"]["CheckoutOut"];
                    "application/xml": components["schemas"]["CheckoutOut"];
                    "text/xml": components["schemas"]["CheckoutOut"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                    "text/json": components["schemas"]["ErrorOut"];
                    "application/xml": components["schemas"]["ErrorOut"];
                    "text/xml": components["schemas"]["ErrorOut"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                    "text/json": components["schemas"]["ErrorOut"];
                    "application/xml": components["schemas"]["ErrorOut"];
                    "text/xml": components["schemas"]["ErrorOut"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                    "text/json": components["schemas"]["ErrorOut"];
                    "application/xml": components["schemas"]["ErrorOut"];
                    "text/xml": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    GetOrder: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The order ID. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrderOut"];
                    "text/json": components["schemas"]["OrderOut"];
                    "application/xml": components["schemas"]["OrderOut"];
                    "text/xml": components["schemas"]["OrderOut"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                    "text/json": components["schemas"]["ErrorOut"];
                    "application/xml": components["schemas"]["ErrorOut"];
                    "text/xml": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    GetProduct: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The product ID. */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductOut"];
                    "text/json": components["schemas"]["ProductOut"];
                    "application/xml": components["schemas"]["ProductOut"];
                    "text/xml": components["schemas"]["ProductOut"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    /**
                     * @example {
                     *       "message": "No product with the ID 'unknown-product' was found.",
                     *       "hint": "Does the ID match any products found under 'Producten'?",
                     *       "url": "https://portal.printapi.nl/test/manage/productoffers"
                     *     }
                     */
                    "application/json": components["schemas"]["ErrorOut"];
                    /**
                     * @example {
                     *       "message": "No product with the ID 'unknown-product' was found.",
                     *       "hint": "Does the ID match any products found under 'Producten'?",
                     *       "url": "https://portal.printapi.nl/test/manage/productoffers"
                     *     }
                     */
                    "text/json": components["schemas"]["ErrorOut"];
                    /**
                     * @example <Error xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                     *       <Message>No product with the ID 'unknown-product' was found.</Message>
                     *       <Hint>Does the ID match any products found under 'Producten'?</Hint>
                     *       <Url>https://portal.printapi.nl/test/manage/productoffers</Url>
                     *     </Error>
                     */
                    "application/xml": components["schemas"]["ErrorOut"];
                    /**
                     * @example <Error xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                     *       <Message>No product with the ID 'unknown-product' was found.</Message>
                     *       <Hint>Does the ID match any products found under 'Producten'?</Hint>
                     *       <Url>https://portal.printapi.nl/test/manage/productoffers</Url>
                     *     </Error>
                     */
                    "text/xml": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
    Upload: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description The order ID. */
                code: string;
            };
            cookie?: never;
        };
        /** @description The print file, posted either as a raw body with the file's media type, or as a single part of a multipart/form-data body. */
        requestBody: {
            content: {
                "application/pdf": string;
                "image/png": string;
                "image/jpeg": string;
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadResultOut"];
                    "text/json": components["schemas"]["UploadResultOut"];
                    "application/xml": components["schemas"]["UploadResultOut"];
                    "text/xml": components["schemas"]["UploadResultOut"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                    "text/json": components["schemas"]["ErrorOut"];
                    "application/xml": components["schemas"]["ErrorOut"];
                    "text/xml": components["schemas"]["ErrorOut"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                    "text/json": components["schemas"]["ErrorOut"];
                    "application/xml": components["schemas"]["ErrorOut"];
                    "text/xml": components["schemas"]["ErrorOut"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                    "text/json": components["schemas"]["ErrorOut"];
                    "application/xml": components["schemas"]["ErrorOut"];
                    "text/xml": components["schemas"]["ErrorOut"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorOut"];
                    "text/json": components["schemas"]["ErrorOut"];
                    "application/xml": components["schemas"]["ErrorOut"];
                    "text/xml": components["schemas"]["ErrorOut"];
                };
            };
        };
    };
}

export type AddressIn = components['schemas']['AddressIn'];
export type AddressOut = components['schemas']['AddressOut'];
export type BillingIn = components['schemas']['BillingIn'];
export type BillingOut = components['schemas']['BillingOut'];
export type CancellationRequestIn = components['schemas']['CancellationRequestIn'];
export type CancellationStatus = components['schemas']['CancellationStatus'];
export type CancellationStatusOut = components['schemas']['CancellationStatusOut'];
export type CheckoutIn = components['schemas']['CheckoutIn'];
export type CheckoutOut = components['schemas']['CheckoutOut'];
export type Country = components['schemas']['Country'];
export type CouponIn = components['schemas']['CouponIn'];
export type CouponQuoteOut = components['schemas']['CouponQuoteOut'];
export type CouponScope = components['schemas']['CouponScope'];
export type CouponState = components['schemas']['CouponState'];
export type CouponType = components['schemas']['CouponType'];
export type ErrorFieldOut = components['schemas']['ErrorFieldOut'];
export type ErrorOut = components['schemas']['ErrorOut'];
export type FileStatus = components['schemas']['FileStatus'];
export type FileType = components['schemas']['FileType'];
export type FixedFormatDateTime = components['schemas']['FixedFormatDateTime'];
export type InvoiceEntryOut = components['schemas']['InvoiceEntryOut'];
export type InvoiceEntryTaxOut = components['schemas']['InvoiceEntryTaxOut'];
export type InvoiceOut = components['schemas']['InvoiceOut'];
export type InvoicingState = components['schemas']['InvoicingState'];
export type OrderIn = components['schemas']['OrderIn'];
export type OrderItemFileListEntryOut = components['schemas']['OrderItemFileListEntryOut'];
export type OrderItemFileListIn = components['schemas']['OrderItemFileListIn'];
export type OrderItemFileListOut = components['schemas']['OrderItemFileListOut'];
export type OrderItemIn = components['schemas']['OrderItemIn'];
export type OrderItemOptionIn = components['schemas']['OrderItemOptionIn'];
export type OrderItemOptionOut = components['schemas']['OrderItemOptionOut'];
export type OrderItemOut = components['schemas']['OrderItemOut'];
export type OrderListEntryOut = components['schemas']['OrderListEntryOut'];
export type OrderListOut = components['schemas']['OrderListOut'];
export type OrderOut = components['schemas']['OrderOut'];
export type OrderStatus = components['schemas']['OrderStatus'];
export type OrderStatusOut = components['schemas']['OrderStatusOut'];
export type OrderStatusUpdateListEntryOut = components['schemas']['OrderStatusUpdateListEntryOut'];
export type OrderStatusUpdateListOut = components['schemas']['OrderStatusUpdateListOut'];
export type PaymentStatus = components['schemas']['PaymentStatus'];
export type PriceOut = components['schemas']['PriceOut'];
export type ProductFileOut = components['schemas']['ProductFileOut'];
export type ProductionSpeed = components['schemas']['ProductionSpeed'];
export type ProductionTimeOut = components['schemas']['ProductionTimeOut'];
export type ProductListEntryOut = components['schemas']['ProductListEntryOut'];
export type ProductListOut = components['schemas']['ProductListOut'];
export type ProductOptionChoiceOut = components['schemas']['ProductOptionChoiceOut'];
export type ProductOptionOut = components['schemas']['ProductOptionOut'];
export type ProductOut = components['schemas']['ProductOut'];
export type ProductWithDetailsListOut = components['schemas']['ProductWithDetailsListOut'];
export type QuantityDiscountOut = components['schemas']['QuantityDiscountOut'];
export type ShipmentIn = components['schemas']['ShipmentIn'];
export type ShipmentItemIn = components['schemas']['ShipmentItemIn'];
export type ShippingIn = components['schemas']['ShippingIn'];
export type ShippingMethodOut = components['schemas']['ShippingMethodOut'];
export type ShippingOut = components['schemas']['ShippingOut'];
export type ShippingPreference = components['schemas']['ShippingPreference'];
export type ShippingQuoteOut = components['schemas']['ShippingQuoteOut'];
export type UploadResultOut = components['schemas']['UploadResultOut'];

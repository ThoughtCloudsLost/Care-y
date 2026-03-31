/**
* | output |
* | --- |
* | "No push subscriptions found. Subscribe a device first." |
*
* @param {Error_No_Push_SubscriptionsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_no_push_subscriptions: ((inputs?: Error_No_Push_SubscriptionsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_No_Push_SubscriptionsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_No_Push_SubscriptionsInputs = {};

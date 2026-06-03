/**
* | output |
* | --- |
* | "No push subscription found. Enable notifications in your browser first." |
*
* @param {Twofa_Push_No_SubscriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_push_no_subscription: ((inputs?: Twofa_Push_No_SubscriptionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Push_No_SubscriptionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Push_No_SubscriptionInputs = {};

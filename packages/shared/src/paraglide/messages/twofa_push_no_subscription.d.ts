/**
* | output |
* | --- |
* | "Notifications are off in this browser. Turn them on first, then try again." |
*
* @param {Twofa_Push_No_SubscriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_push_no_subscription: ((inputs?: Twofa_Push_No_SubscriptionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Push_No_SubscriptionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Push_No_SubscriptionInputs = {};

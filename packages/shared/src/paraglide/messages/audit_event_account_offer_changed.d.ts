/**
* | output |
* | --- |
* | "Account offer changed" |
*
* @param {Audit_Event_Account_Offer_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_account_offer_changed: ((inputs?: Audit_Event_Account_Offer_ChangedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Account_Offer_ChangedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Account_Offer_ChangedInputs = {};

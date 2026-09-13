/**
* | output |
* | --- |
* | "Replies go out as regular text messages." |
*
* @param {Ticket_Tier_Sms_ExplainInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_sms_explain: ((inputs?: Ticket_Tier_Sms_ExplainInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Tier_Sms_ExplainInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Tier_Sms_ExplainInputs = {};

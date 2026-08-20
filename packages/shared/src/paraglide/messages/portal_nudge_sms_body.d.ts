/**
* | output |
* | --- |
* | "You have a new message waiting for you." |
*
* @param {Portal_Nudge_Sms_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_nudge_sms_body: ((inputs?: Portal_Nudge_Sms_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Nudge_Sms_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Nudge_Sms_BodyInputs = {};

/**
* | output |
* | --- |
* | "Secure link" |
*
* @param {Followup_Type_Share_LinkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_share_link: ((inputs?: Followup_Type_Share_LinkInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Followup_Type_Share_LinkInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Followup_Type_Share_LinkInputs = {};

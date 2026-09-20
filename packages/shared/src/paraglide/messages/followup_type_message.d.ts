/**
* | output |
* | --- |
* | "Messages" |
*
* @param {Followup_Type_MessageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const followup_type_message: ((inputs?: Followup_Type_MessageInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Followup_Type_MessageInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Followup_Type_MessageInputs = {};

/**
* | output |
* | --- |
* | "Inbound and outbound messages with callers" |
*
* @param {Followup_Type_Message_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const followup_type_message_desc: ((inputs?: Followup_Type_Message_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Followup_Type_Message_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Followup_Type_Message_DescInputs = {};

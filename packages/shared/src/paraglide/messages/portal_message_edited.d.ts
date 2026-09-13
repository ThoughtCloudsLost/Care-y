/**
* | output |
* | --- |
* | "(edited)" |
*
* @param {Portal_Message_EditedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_message_edited: ((inputs?: Portal_Message_EditedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Message_EditedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Message_EditedInputs = {};

/**
* | output |
* | --- |
* | "Change case status" |
*
* @param {Permission_Change_Case_StatusInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_change_case_status: ((inputs?: Permission_Change_Case_StatusInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Change_Case_StatusInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Change_Case_StatusInputs = {};

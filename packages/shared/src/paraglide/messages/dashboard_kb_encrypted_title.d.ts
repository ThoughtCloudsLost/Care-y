/**
* | output |
* | --- |
* | "Updated article" |
*
* @param {Dashboard_Kb_Encrypted_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_kb_encrypted_title: ((inputs?: Dashboard_Kb_Encrypted_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Kb_Encrypted_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Kb_Encrypted_TitleInputs = {};

/**
* | output |
* | --- |
* | "English" |
*
* @param {Admin_Terminology_Lang_EnInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_lang_en: ((inputs?: Admin_Terminology_Lang_EnInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_Lang_EnInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_Lang_EnInputs = {};

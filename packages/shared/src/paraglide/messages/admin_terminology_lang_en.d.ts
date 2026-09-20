/**
* | output |
* | --- |
* | "English" |
*
* @param {Admin_Terminology_Lang_EnInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_lang_en: ((inputs?: Admin_Terminology_Lang_EnInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_Lang_EnInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_Lang_EnInputs = {};

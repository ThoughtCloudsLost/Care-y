/**
* | output |
* | --- |
* | "Plural" |
*
* @param {Admin_Terminology_PluralInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_plural: ((inputs?: Admin_Terminology_PluralInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_PluralInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_PluralInputs = {};

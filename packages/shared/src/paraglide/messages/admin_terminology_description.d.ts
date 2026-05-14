/**
* | output |
* | --- |
* | "Customize the terms your organization uses throughout the app." |
*
* @param {Admin_Terminology_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_description: ((inputs?: Admin_Terminology_DescriptionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_DescriptionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_DescriptionInputs = {};

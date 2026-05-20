/**
* | output |
* | --- |
* | "Organization name, default language, and country calling code." |
*
* @param {Admin_Org_Basics_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_org_basics_description: ((inputs?: Admin_Org_Basics_DescriptionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Org_Basics_DescriptionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Org_Basics_DescriptionInputs = {};

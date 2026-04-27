/**
* | output |
* | --- |
* | "Automatic deletion is off. Tickets, messages, and caller personal information are kept until manually deleted." |
*
* @param {Admin_Retention_Inactive_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_inactive_description: ((inputs?: Admin_Retention_Inactive_DescriptionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Retention_Inactive_DescriptionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Retention_Inactive_DescriptionInputs = {};

/**
* | output |
* | --- |
* | "Closed {tickets} and their data are deleted after {days} days without activity. People with open {tickets} are not affected." |
*
* @param {Admin_Retention_Active_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_active_description: ((inputs: Admin_Retention_Active_DescriptionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Retention_Active_DescriptionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Retention_Active_DescriptionInputs = {
    tickets: NonNullable<unknown>;
    days: NonNullable<unknown>;
};

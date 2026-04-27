/**
* | output |
* | --- |
* | "Disable automatic data deletion?" |
*
* @param {Admin_Retention_Clear_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_clear_title: ((inputs?: Admin_Retention_Clear_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Retention_Clear_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Retention_Clear_TitleInputs = {};

/**
* | output |
* | --- |
* | "Set data retention to {days} days?" |
*
* @param {Admin_Retention_Set_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_set_title: ((inputs: Admin_Retention_Set_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Retention_Set_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Retention_Set_TitleInputs = {
    days: NonNullable<unknown>;
};

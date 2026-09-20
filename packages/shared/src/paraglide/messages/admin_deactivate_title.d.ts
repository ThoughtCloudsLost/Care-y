/**
* | output |
* | --- |
* | "Deactivate {name}?" |
*
* @param {Admin_Deactivate_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_deactivate_title: ((inputs: Admin_Deactivate_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Deactivate_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Deactivate_TitleInputs = {
    name: NonNullable<unknown>;
};

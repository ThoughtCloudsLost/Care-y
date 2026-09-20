/**
* | output |
* | --- |
* | "Reactivate {name}?" |
*
* @param {Admin_Reactivate_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reactivate_title: ((inputs: Admin_Reactivate_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Reactivate_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Reactivate_TitleInputs = {
    name: NonNullable<unknown>;
};

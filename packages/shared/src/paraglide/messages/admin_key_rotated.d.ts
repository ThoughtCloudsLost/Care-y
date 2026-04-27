/**
* | output |
* | --- |
* | "Organization key rotated" |
*
* @param {Admin_Key_RotatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_key_rotated: ((inputs?: Admin_Key_RotatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Key_RotatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Key_RotatedInputs = {};

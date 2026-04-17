/**
* | output |
* | --- |
* | "Keys loaded" |
*
* @param {Admin_Key_Status_OkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_key_status_ok: ((inputs?: Admin_Key_Status_OkInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Key_Status_OkInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Key_Status_OkInputs = {};

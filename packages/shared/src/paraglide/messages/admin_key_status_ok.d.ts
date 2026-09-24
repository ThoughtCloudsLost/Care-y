/**
* | output |
* | --- |
* | "Ready" |
*
* @param {Admin_Key_Status_OkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_key_status_ok: ((inputs?: Admin_Key_Status_OkInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Key_Status_OkInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Key_Status_OkInputs = {};

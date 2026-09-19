/**
* | output |
* | --- |
* | "All records are on the current key." |
*
* @param {Admin_Keys_Reseal_OkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_keys_reseal_ok: ((inputs?: Admin_Keys_Reseal_OkInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Keys_Reseal_OkInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Keys_Reseal_OkInputs = {};

/**
* | output |
* | --- |
* | "All records are on the current key." |
*
* @param {Admin_Keys_Reseal_OkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_keys_reseal_ok: ((inputs?: Admin_Keys_Reseal_OkInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Keys_Reseal_OkInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Keys_Reseal_OkInputs = {};

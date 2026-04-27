/**
* | output |
* | --- |
* | "Organization key loaded" |
*
* @param {Admin_Keys_Org_Key_LoadedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_keys_org_key_loaded: ((inputs?: Admin_Keys_Org_Key_LoadedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Keys_Org_Key_LoadedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Keys_Org_Key_LoadedInputs = {};

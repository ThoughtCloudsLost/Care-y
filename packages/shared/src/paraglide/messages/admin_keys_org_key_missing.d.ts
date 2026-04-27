/**
* | output |
* | --- |
* | "Organization key not configured" |
*
* @param {Admin_Keys_Org_Key_MissingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_keys_org_key_missing: ((inputs?: Admin_Keys_Org_Key_MissingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Keys_Org_Key_MissingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Keys_Org_Key_MissingInputs = {};

/**
* | output |
* | --- |
* | "Keys" |
*
* @param {Admin_Tab_KeysInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_keys: ((inputs?: Admin_Tab_KeysInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Tab_KeysInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Tab_KeysInputs = {};

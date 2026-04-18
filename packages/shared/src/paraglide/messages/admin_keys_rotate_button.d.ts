/**
* | output |
* | --- |
* | "Rotate Org Key" |
*
* @param {Admin_Keys_Rotate_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_keys_rotate_button: ((inputs?: Admin_Keys_Rotate_ButtonInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Keys_Rotate_ButtonInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Keys_Rotate_ButtonInputs = {};

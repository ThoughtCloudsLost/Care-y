/**
* | output |
* | --- |
* | "Hasn't signed in yet" |
*
* @param {Admin_Key_Status_No_KeysInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_key_status_no_keys: ((inputs?: Admin_Key_Status_No_KeysInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Key_Status_No_KeysInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Key_Status_No_KeysInputs = {};

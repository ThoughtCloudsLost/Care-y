/**
* | output |
* | --- |
* | "Needs a key share" |
*
* @param {Admin_Key_Status_No_Org_KeyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_key_status_no_org_key: ((inputs?: Admin_Key_Status_No_Org_KeyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Key_Status_No_Org_KeyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Key_Status_No_Org_KeyInputs = {};

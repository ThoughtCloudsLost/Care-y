/**
* | output |
* | --- |
* | "Switching modes will reset your current telephony configuration. If you have BYOT credentials stored, they will be deleted." |
*
* @param {Admin_Telephony_Change_Mode_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_change_mode_confirm_body: ((inputs?: Admin_Telephony_Change_Mode_Confirm_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Change_Mode_Confirm_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Change_Mode_Confirm_BodyInputs = {};

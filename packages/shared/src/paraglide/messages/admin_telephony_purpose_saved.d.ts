/**
* | output |
* | --- |
* | "Roles updated" |
*
* @param {Admin_Telephony_Purpose_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_purpose_saved: ((inputs?: Admin_Telephony_Purpose_SavedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Purpose_SavedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Purpose_SavedInputs = {};

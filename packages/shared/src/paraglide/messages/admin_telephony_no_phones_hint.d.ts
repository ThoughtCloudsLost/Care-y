/**
* | output |
* | --- |
* | "Tap Refresh Numbers above to sync from {provider}." |
*
* @param {Admin_Telephony_No_Phones_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_no_phones_hint: ((inputs: Admin_Telephony_No_Phones_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_No_Phones_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_No_Phones_HintInputs = {
    provider: NonNullable<unknown>;
};

/**
* | output |
* | --- |
* | "{provider} (self-managed)" |
*
* @param {Admin_Telephony_Mode_ByotInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_mode_byot: ((inputs: Admin_Telephony_Mode_ByotInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Mode_ByotInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Mode_ByotInputs = {
    provider: NonNullable<unknown>;
};

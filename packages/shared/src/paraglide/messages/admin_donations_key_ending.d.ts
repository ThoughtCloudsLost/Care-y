/**
* | output |
* | --- |
* | "Key ending {hint}" |
*
* @param {Admin_Donations_Key_EndingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_key_ending: ((inputs: Admin_Donations_Key_EndingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Donations_Key_EndingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Donations_Key_EndingInputs = {
    hint: NonNullable<unknown>;
};

/**
* | output |
* | --- |
* | "Update {provider} credentials" |
*
* @param {Admin_Telephony_Credentials_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_telephony_credentials_heading: ((inputs: Admin_Telephony_Credentials_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Telephony_Credentials_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Telephony_Credentials_HeadingInputs = {
    provider: NonNullable<unknown>;
};

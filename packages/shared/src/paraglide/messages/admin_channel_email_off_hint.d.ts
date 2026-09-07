/**
* | output |
* | --- |
* | "Volunteers cannot send emails to clients." |
*
* @param {Admin_Channel_Email_Off_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_channel_email_off_hint: ((inputs?: Admin_Channel_Email_Off_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Channel_Email_Off_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Channel_Email_Off_HintInputs = {};

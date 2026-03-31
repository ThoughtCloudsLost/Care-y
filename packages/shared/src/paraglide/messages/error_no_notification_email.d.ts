/**
* | output |
* | --- |
* | "No notification email configured. Set an email address in your profile first." |
*
* @param {Error_No_Notification_EmailInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_no_notification_email: ((inputs?: Error_No_Notification_EmailInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_No_Notification_EmailInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_No_Notification_EmailInputs = {};

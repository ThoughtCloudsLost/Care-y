/**
* | output |
* | --- |
* | "Email could not be delivered. Please try again." |
*
* @param {Error_Email_Send_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_email_send_failed: ((inputs?: Error_Email_Send_FailedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Email_Send_FailedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Email_Send_FailedInputs = {};

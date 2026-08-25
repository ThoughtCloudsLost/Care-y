/**
* | output |
* | --- |
* | "Your message did not send. Your words are back in the box. Tap send to try again." |
*
* @param {Portal_Send_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_send_failed: ((inputs?: Portal_Send_FailedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Send_FailedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Send_FailedInputs = {};

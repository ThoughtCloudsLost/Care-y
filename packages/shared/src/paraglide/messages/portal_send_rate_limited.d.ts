/**
* | output |
* | --- |
* | "Your message did not send. Your words are back in the box. Too many messages went out in a short time; waiting a little, or a reply from your support team, c..." |
*
* @param {Portal_Send_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_send_rate_limited: ((inputs?: Portal_Send_Rate_LimitedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Send_Rate_LimitedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Send_Rate_LimitedInputs = {};

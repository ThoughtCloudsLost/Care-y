/**
* | output |
* | --- |
* | "Donation webhook registered" |
*
* @param {Admin_Donations_Webhook_RegisteredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_webhook_registered: ((inputs?: Admin_Donations_Webhook_RegisteredInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Donations_Webhook_RegisteredInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Donations_Webhook_RegisteredInputs = {};

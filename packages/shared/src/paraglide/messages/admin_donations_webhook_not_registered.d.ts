/**
* | output |
* | --- |
* | "Donation webhook not registered. Remove this connection and add it again to retry." |
*
* @param {Admin_Donations_Webhook_Not_RegisteredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_webhook_not_registered: ((inputs?: Admin_Donations_Webhook_Not_RegisteredInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Donations_Webhook_Not_RegisteredInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Donations_Webhook_Not_RegisteredInputs = {};

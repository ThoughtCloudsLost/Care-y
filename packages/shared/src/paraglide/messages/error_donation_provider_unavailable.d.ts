/**
* | output |
* | --- |
* | "The donation provider could not be reached. Try again in a minute." |
*
* @param {Error_Donation_Provider_UnavailableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_donation_provider_unavailable: ((inputs?: Error_Donation_Provider_UnavailableInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Donation_Provider_UnavailableInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Donation_Provider_UnavailableInputs = {};

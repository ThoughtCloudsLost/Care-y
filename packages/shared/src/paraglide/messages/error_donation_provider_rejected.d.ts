/**
* | output |
* | --- |
* | "The donation provider refused the API key. Check the key and try again." |
*
* @param {Error_Donation_Provider_RejectedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_donation_provider_rejected: ((inputs?: Error_Donation_Provider_RejectedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Donation_Provider_RejectedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Donation_Provider_RejectedInputs = {};

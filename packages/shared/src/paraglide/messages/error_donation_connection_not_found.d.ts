/**
* | output |
* | --- |
* | "That donation provider connection no longer exists." |
*
* @param {Error_Donation_Connection_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_donation_connection_not_found: ((inputs?: Error_Donation_Connection_Not_FoundInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Donation_Connection_Not_FoundInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Donation_Connection_Not_FoundInputs = {};

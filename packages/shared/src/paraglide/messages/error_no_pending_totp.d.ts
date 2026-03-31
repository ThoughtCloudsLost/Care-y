/**
* | output |
* | --- |
* | "No pending authenticator setup found. Please start again." |
*
* @param {Error_No_Pending_TotpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_no_pending_totp: ((inputs?: Error_No_Pending_TotpInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_No_Pending_TotpInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_No_Pending_TotpInputs = {};

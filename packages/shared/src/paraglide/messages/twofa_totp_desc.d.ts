/**
* | output |
* | --- |
* | "A separate app on your phone generates a new 6-digit code every 30 seconds. Common apps include Google Authenticator and Authy. Works even without an interne..." |
*
* @param {Twofa_Totp_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_desc: ((inputs?: Twofa_Totp_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Totp_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Totp_DescInputs = {};

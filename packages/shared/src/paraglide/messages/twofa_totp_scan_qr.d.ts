/**
* | output |
* | --- |
* | "Scan this code with your authenticator app" |
*
* @param {Twofa_Totp_Scan_QrInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_scan_qr: ((inputs?: Twofa_Totp_Scan_QrInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Totp_Scan_QrInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Totp_Scan_QrInputs = {};

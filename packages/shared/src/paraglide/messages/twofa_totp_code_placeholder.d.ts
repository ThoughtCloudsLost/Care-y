/**
* | output |
* | --- |
* | "000000" |
*
* @param {Twofa_Totp_Code_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_totp_code_placeholder: ((inputs?: Twofa_Totp_Code_PlaceholderInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Totp_Code_PlaceholderInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Totp_Code_PlaceholderInputs = {};

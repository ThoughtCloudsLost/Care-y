/**
* | output |
* | --- |
* | "Use passkey" |
*
* @param {Twofa_Passkey_UseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_passkey_use: ((inputs?: Twofa_Passkey_UseInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Passkey_UseInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Passkey_UseInputs = {};

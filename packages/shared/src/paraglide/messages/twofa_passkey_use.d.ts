/**
* | output |
* | --- |
* | "Use passkey" |
*
* @param {Twofa_Passkey_UseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_passkey_use: ((inputs?: Twofa_Passkey_UseInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Passkey_UseInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Passkey_UseInputs = {};

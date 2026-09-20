/**
* | output |
* | --- |
* | "Register passkey" |
*
* @param {Twofa_Passkey_RegisterInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_passkey_register: ((inputs?: Twofa_Passkey_RegisterInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Passkey_RegisterInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Passkey_RegisterInputs = {};

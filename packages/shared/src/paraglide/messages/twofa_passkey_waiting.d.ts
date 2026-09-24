/**
* | output |
* | --- |
* | "Waiting for authenticator..." |
*
* @param {Twofa_Passkey_WaitingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_passkey_waiting: ((inputs?: Twofa_Passkey_WaitingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Passkey_WaitingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Passkey_WaitingInputs = {};

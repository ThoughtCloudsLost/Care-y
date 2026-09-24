/**
* | output |
* | --- |
* | "Preparing your keys..." |
*
* @param {Auth_Phase_Argon2idInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_phase_argon2id: ((inputs?: Auth_Phase_Argon2idInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Phase_Argon2idInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Phase_Argon2idInputs = {};

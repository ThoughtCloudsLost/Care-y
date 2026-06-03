/**
* | output |
* | --- |
* | "Deriving encryption keys..." |
*
* @param {Auth_Phase_Argon2idInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_phase_argon2id: ((inputs?: Auth_Phase_Argon2idInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Phase_Argon2idInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Phase_Argon2idInputs = {};

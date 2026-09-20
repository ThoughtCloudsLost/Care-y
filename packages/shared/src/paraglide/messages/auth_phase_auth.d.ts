/**
* | output |
* | --- |
* | "Verifying credentials..." |
*
* @param {Auth_Phase_AuthInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_phase_auth: ((inputs?: Auth_Phase_AuthInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Phase_AuthInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Phase_AuthInputs = {};

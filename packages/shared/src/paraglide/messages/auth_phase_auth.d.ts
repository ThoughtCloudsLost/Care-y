/**
* | output |
* | --- |
* | "Verifying credentials..." |
*
* @param {Auth_Phase_AuthInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_phase_auth: ((inputs?: Auth_Phase_AuthInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Phase_AuthInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Phase_AuthInputs = {};

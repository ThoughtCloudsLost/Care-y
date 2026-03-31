/**
* | output |
* | --- |
* | "Signing in..." |
*
* @param {Auth_Signing_InInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_signing_in: ((inputs?: Auth_Signing_InInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Signing_InInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Signing_InInputs = {};

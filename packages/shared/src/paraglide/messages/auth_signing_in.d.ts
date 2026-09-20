/**
* | output |
* | --- |
* | "Signing in..." |
*
* @param {Auth_Signing_InInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_signing_in: ((inputs?: Auth_Signing_InInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Signing_InInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Signing_InInputs = {};

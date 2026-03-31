/**
* | output |
* | --- |
* | "Sign in" |
*
* @param {Auth_Sign_InInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_sign_in: ((inputs?: Auth_Sign_InInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Sign_InInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Sign_InInputs = {};

/**
* | output |
* | --- |
* | "Sign in to continue" |
*
* @param {Auth_Sign_In_ContinueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_sign_in_continue: ((inputs?: Auth_Sign_In_ContinueInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Sign_In_ContinueInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Sign_In_ContinueInputs = {};

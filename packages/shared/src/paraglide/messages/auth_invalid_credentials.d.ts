/**
* | output |
* | --- |
* | "Invalid username or password" |
*
* @param {Auth_Invalid_CredentialsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_invalid_credentials: ((inputs?: Auth_Invalid_CredentialsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Invalid_CredentialsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Invalid_CredentialsInputs = {};

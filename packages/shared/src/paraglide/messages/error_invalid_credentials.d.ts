/**
* | output |
* | --- |
* | "Invalid username or password." |
*
* @param {Error_Invalid_CredentialsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_invalid_credentials: ((inputs?: Error_Invalid_CredentialsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Invalid_CredentialsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Invalid_CredentialsInputs = {};

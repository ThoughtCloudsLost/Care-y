/**
* | output |
* | --- |
* | "Unknown credential." |
*
* @param {Error_Unknown_CredentialInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_unknown_credential: ((inputs?: Error_Unknown_CredentialInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Unknown_CredentialInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Unknown_CredentialInputs = {};

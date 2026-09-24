/**
* | output |
* | --- |
* | "You are not signed in." |
*
* @param {Error_Not_AuthenticatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_not_authenticated: ((inputs?: Error_Not_AuthenticatedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Not_AuthenticatedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Not_AuthenticatedInputs = {};

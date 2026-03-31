/**
* | output |
* | --- |
* | "You are not signed in." |
*
* @param {Error_Not_AuthenticatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_not_authenticated: ((inputs?: Error_Not_AuthenticatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Not_AuthenticatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Not_AuthenticatedInputs = {};

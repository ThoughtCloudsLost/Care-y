/**
* | output |
* | --- |
* | "No security key challenge found. Please try again." |
*
* @param {Error_Webauthn_Challenge_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_webauthn_challenge_not_found: ((inputs?: Error_Webauthn_Challenge_Not_FoundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Webauthn_Challenge_Not_FoundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Webauthn_Challenge_Not_FoundInputs = {};

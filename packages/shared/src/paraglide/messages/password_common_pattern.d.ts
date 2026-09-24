/**
* | output |
* | --- |
* | "This follows a predictable pattern. Try something more varied." |
*
* @param {Password_Common_PatternInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const password_common_pattern: ((inputs?: Password_Common_PatternInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Password_Common_PatternInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Password_Common_PatternInputs = {};

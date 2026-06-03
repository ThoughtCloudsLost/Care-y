/**
* | output |
* | --- |
* | "This follows a predictable pattern. Try something more varied." |
*
* @param {Password_Common_PatternInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const password_common_pattern: ((inputs?: Password_Common_PatternInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Password_Common_PatternInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Password_Common_PatternInputs = {};

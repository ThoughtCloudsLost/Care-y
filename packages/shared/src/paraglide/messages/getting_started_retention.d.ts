/**
* | output |
* | --- |
* | "Configure data retention" |
*
* @param {Getting_Started_RetentionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_retention: ((inputs?: Getting_Started_RetentionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_RetentionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_RetentionInputs = {};

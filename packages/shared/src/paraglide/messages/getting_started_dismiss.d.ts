/**
* | output |
* | --- |
* | "Dismiss" |
*
* @param {Getting_Started_DismissInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_dismiss: ((inputs?: Getting_Started_DismissInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_DismissInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_DismissInputs = {};

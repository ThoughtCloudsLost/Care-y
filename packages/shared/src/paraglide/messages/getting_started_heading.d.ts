/**
* | output |
* | --- |
* | "Getting Started" |
*
* @param {Getting_Started_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_heading: ((inputs?: Getting_Started_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_HeadingInputs = {};

/**
* | output |
* | --- |
* | "Record what callers hear when they call in. Covers welcome messages and hold music." |
*
* @param {Getting_Started_Greetings_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_greetings_desc: ((inputs?: Getting_Started_Greetings_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_Greetings_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_Greetings_DescInputs = {};

/**
* | output |
* | --- |
* | "Give volunteers quick-reference guides and protocols." |
*
* @param {Getting_Started_Kb_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_kb_desc: ((inputs?: Getting_Started_Kb_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_Kb_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_Kb_DescInputs = {};

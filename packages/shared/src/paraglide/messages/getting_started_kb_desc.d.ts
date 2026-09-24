/**
* | output |
* | --- |
* | "Give {volunteers} quick-reference guides and protocols." |
*
* @param {Getting_Started_Kb_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_kb_desc: ((inputs: Getting_Started_Kb_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_Kb_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_Kb_DescInputs = {
    volunteers: NonNullable<unknown>;
};

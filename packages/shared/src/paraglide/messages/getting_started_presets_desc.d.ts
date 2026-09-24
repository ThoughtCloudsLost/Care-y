/**
* | output |
* | --- |
* | "Create quick-response templates {volunteers} can send in {tickets}." |
*
* @param {Getting_Started_Presets_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_presets_desc: ((inputs: Getting_Started_Presets_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_Presets_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_Presets_DescInputs = {
    volunteers: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};

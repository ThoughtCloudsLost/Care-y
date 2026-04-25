/**
* | output |
* | --- |
* | "Disagree" |
*
* @param {Reaction_DisagreeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reaction_disagree: ((inputs?: Reaction_DisagreeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reaction_DisagreeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reaction_DisagreeInputs = {};

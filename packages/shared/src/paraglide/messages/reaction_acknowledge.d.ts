/**
* | output |
* | --- |
* | "Acknowledge" |
*
* @param {Reaction_AcknowledgeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reaction_acknowledge: ((inputs?: Reaction_AcknowledgeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reaction_AcknowledgeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reaction_AcknowledgeInputs = {};

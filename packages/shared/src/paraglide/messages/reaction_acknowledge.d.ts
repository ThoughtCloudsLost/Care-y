/**
* | output |
* | --- |
* | "Acknowledge" |
*
* @param {Reaction_AcknowledgeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reaction_acknowledge: ((inputs?: Reaction_AcknowledgeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reaction_AcknowledgeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reaction_AcknowledgeInputs = {};

/**
* | output |
* | --- |
* | "Complete" |
*
* @param {Reaction_CompleteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reaction_complete: ((inputs?: Reaction_CompleteInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reaction_CompleteInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reaction_CompleteInputs = {};

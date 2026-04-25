/**
* | output |
* | --- |
* | "Flag" |
*
* @param {Reaction_FlagInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reaction_flag: ((inputs?: Reaction_FlagInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reaction_FlagInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reaction_FlagInputs = {};

/**
* | output |
* | --- |
* | "You" |
*
* @param {Reaction_YouInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reaction_you: ((inputs?: Reaction_YouInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reaction_YouInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reaction_YouInputs = {};

/**
* | output |
* | --- |
* | "Approve" |
*
* @param {Reaction_ApproveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const reaction_approve: ((inputs?: Reaction_ApproveInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reaction_ApproveInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reaction_ApproveInputs = {};

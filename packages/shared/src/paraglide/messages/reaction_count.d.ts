/**
* | output |
* | --- |
* | "{count} {label}" |
*
* @param {Reaction_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reaction_count: ((inputs: Reaction_CountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Reaction_CountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Reaction_CountInputs = {
    count: NonNullable<unknown>;
    label: NonNullable<unknown>;
};

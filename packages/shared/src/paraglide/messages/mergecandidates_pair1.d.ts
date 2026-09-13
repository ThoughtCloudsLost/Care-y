export { mergecandidates_pair1 as "mergeCandidates_pair" };
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mergecandidates_Pair1Inputs = {
    aliasA: NonNullable<unknown>;
    aliasB: NonNullable<unknown>;
};
/**
* | output |
* | --- |
* | "{aliasA} / {aliasB}" |
*
* @param {Mergecandidates_Pair1Inputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
declare const mergecandidates_pair1: ((inputs: Mergecandidates_Pair1Inputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mergecandidates_Pair1Inputs, {
    locale?: "en" | "es";
}, {}>;

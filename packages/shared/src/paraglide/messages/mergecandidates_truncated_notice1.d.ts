export { mergecandidates_truncated_notice1 as mergeCandidates_truncated_notice };
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mergecandidates_Truncated_Notice1Inputs = {};
/**
* | output |
* | --- |
* | "There are more possible duplicates than shown. Resolve or dismiss some, or mark shared numbers, to see the rest." |
*
* @param {Mergecandidates_Truncated_Notice1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
declare const mergecandidates_truncated_notice1: ((inputs?: Mergecandidates_Truncated_Notice1Inputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mergecandidates_Truncated_Notice1Inputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;

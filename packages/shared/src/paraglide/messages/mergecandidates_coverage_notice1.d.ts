export { mergecandidates_coverage_notice1 as "mergeCandidates_coverage_notice" };
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mergecandidates_Coverage_Notice1Inputs = {};
/**
* | output |
* | --- |
* | "This scan covers only clients whose tickets you can decrypt. Other volunteers may see different results." |
*
* @param {Mergecandidates_Coverage_Notice1Inputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
declare const mergecandidates_coverage_notice1: ((inputs?: Mergecandidates_Coverage_Notice1Inputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mergecandidates_Coverage_Notice1Inputs, {
    locale?: "en" | "es";
}, {}>;

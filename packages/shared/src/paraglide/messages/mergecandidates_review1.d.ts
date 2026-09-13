export { mergecandidates_review1 as "mergeCandidates_review" };
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mergecandidates_Review1Inputs = {};
/**
* | output |
* | --- |
* | "Review" |
*
* @param {Mergecandidates_Review1Inputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
declare const mergecandidates_review1: ((inputs?: Mergecandidates_Review1Inputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mergecandidates_Review1Inputs, {
    locale?: "en" | "es";
}, {}>;

export { mergecandidates_match_email1 as mergeCandidates_match_email };
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mergecandidates_Match_Email1Inputs = {};
/**
* | output |
* | --- |
* | "Same email address" |
*
* @param {Mergecandidates_Match_Email1Inputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
declare const mergecandidates_match_email1: ((inputs?: Mergecandidates_Match_Email1Inputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mergecandidates_Match_Email1Inputs, {
    locale?: "en" | "es";
}, {}>;

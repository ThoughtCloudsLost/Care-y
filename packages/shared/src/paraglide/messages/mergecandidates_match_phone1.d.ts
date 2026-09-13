export { mergecandidates_match_phone1 as mergeCandidates_match_phone };
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mergecandidates_Match_Phone1Inputs = {};
/**
* | output |
* | --- |
* | "Same phone number" |
*
* @param {Mergecandidates_Match_Phone1Inputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
declare const mergecandidates_match_phone1: ((inputs?: Mergecandidates_Match_Phone1Inputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mergecandidates_Match_Phone1Inputs, {
    locale?: "en" | "es";
}, {}>;

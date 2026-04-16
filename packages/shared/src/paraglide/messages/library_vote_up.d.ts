/**
* | output |
* | --- |
* | "Helpful" |
*
* @param {Library_Vote_UpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_vote_up: ((inputs?: Library_Vote_UpInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Vote_UpInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Vote_UpInputs = {};

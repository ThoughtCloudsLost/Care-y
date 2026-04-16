/**
* | output |
* | --- |
* | "Not helpful" |
*
* @param {Library_Vote_DownInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_vote_down: ((inputs?: Library_Vote_DownInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Vote_DownInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Vote_DownInputs = {};

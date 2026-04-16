/**
* | output |
* | --- |
* | "{up} of {total} found helpful" |
*
* @param {Library_Vote_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_vote_count: ((inputs: Library_Vote_CountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Vote_CountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Vote_CountInputs = {
    up: NonNullable<unknown>;
    total: NonNullable<unknown>;
};

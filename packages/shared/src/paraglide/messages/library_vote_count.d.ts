/**
* | output |
* | --- |
* | "{up} of {total} found helpful" |
*
* @param {Library_Vote_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_vote_count: ((inputs: Library_Vote_CountInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Vote_CountInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Vote_CountInputs = {
    up: NonNullable<unknown>;
    total: NonNullable<unknown>;
};

/**
* | output |
* | --- |
* | "{count} votes" |
*
* @param {Dashboard_Kb_RatingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_kb_rating: ((inputs: Dashboard_Kb_RatingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Kb_RatingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Kb_RatingInputs = {
    count: NonNullable<unknown>;
};

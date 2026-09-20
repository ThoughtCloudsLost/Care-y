/**
* | output |
* | --- |
* | "{count} votes" |
*
* @param {Dashboard_Kb_Vote_Count_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_kb_vote_count_other: ((inputs: Dashboard_Kb_Vote_Count_OtherInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Kb_Vote_Count_OtherInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Kb_Vote_Count_OtherInputs = {
    count: NonNullable<unknown>;
};

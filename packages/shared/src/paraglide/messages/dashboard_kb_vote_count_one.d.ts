/**
* | output |
* | --- |
* | "{count} vote" |
*
* @param {Dashboard_Kb_Vote_Count_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_kb_vote_count_one: ((inputs: Dashboard_Kb_Vote_Count_OneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Kb_Vote_Count_OneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Kb_Vote_Count_OneInputs = {
    count: NonNullable<unknown>;
};

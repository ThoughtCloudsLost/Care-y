/**
* | output |
* | --- |
* | "{count} recently updated" |
*
* @param {Dashboard_Kb_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_kb_summary: ((inputs: Dashboard_Kb_SummaryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Kb_SummaryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Kb_SummaryInputs = {
    count: NonNullable<unknown>;
};

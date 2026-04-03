/**
* | output |
* | --- |
* | "{count} events in the last hour" |
*
* @param {Dashboard_Activity_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_summary: ((inputs: Dashboard_Activity_SummaryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Activity_SummaryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Activity_SummaryInputs = {
    count: NonNullable<unknown>;
};

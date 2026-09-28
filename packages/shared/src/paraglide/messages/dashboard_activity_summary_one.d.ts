/**
* | output |
* | --- |
* | "{count} event in the last hour" |
*
* @param {Dashboard_Activity_Summary_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_summary_one: ((inputs: Dashboard_Activity_Summary_OneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Activity_Summary_OneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Activity_Summary_OneInputs = {
    count: NonNullable<unknown>;
};

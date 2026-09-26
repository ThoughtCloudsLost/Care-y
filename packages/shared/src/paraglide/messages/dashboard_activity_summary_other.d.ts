/**
* | output |
* | --- |
* | "{count} events in the last hour" |
*
* @param {Dashboard_Activity_Summary_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_summary_other: ((inputs: Dashboard_Activity_Summary_OtherInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Activity_Summary_OtherInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Activity_Summary_OtherInputs = {
    count: NonNullable<unknown>;
};

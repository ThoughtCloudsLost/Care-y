/**
* | output |
* | --- |
* | "{count}d ago" |
*
* @param {Dashboard_Time_Days_AgoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_time_days_ago: ((inputs: Dashboard_Time_Days_AgoInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Time_Days_AgoInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Time_Days_AgoInputs = {
    count: NonNullable<unknown>;
};

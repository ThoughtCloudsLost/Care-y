/**
* | output |
* | --- |
* | "{count}h ago" |
*
* @param {Dashboard_Time_Hours_AgoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_time_hours_ago: ((inputs: Dashboard_Time_Hours_AgoInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Time_Hours_AgoInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Time_Hours_AgoInputs = {
    count: NonNullable<unknown>;
};

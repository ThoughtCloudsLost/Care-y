/**
* | output |
* | --- |
* | "{count}m ago" |
*
* @param {Dashboard_Time_Minutes_AgoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_time_minutes_ago: ((inputs: Dashboard_Time_Minutes_AgoInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Time_Minutes_AgoInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Time_Minutes_AgoInputs = {
    count: NonNullable<unknown>;
};

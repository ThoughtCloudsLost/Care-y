/**
* | output |
* | --- |
* | "Just now" |
*
* @param {Dashboard_Time_Just_NowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_time_just_now: ((inputs?: Dashboard_Time_Just_NowInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Time_Just_NowInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Time_Just_NowInputs = {};

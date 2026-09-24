/**
* | output |
* | --- |
* | "Just now" |
*
* @param {Dashboard_Time_Just_NowInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_time_just_now: ((inputs?: Dashboard_Time_Just_NowInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Time_Just_NowInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Time_Just_NowInputs = {};

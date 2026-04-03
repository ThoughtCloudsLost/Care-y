/**
* | output |
* | --- |
* | "No recent activity" |
*
* @param {Dashboard_Activity_No_ActivityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_no_activity: ((inputs?: Dashboard_Activity_No_ActivityInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Activity_No_ActivityInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Activity_No_ActivityInputs = {};

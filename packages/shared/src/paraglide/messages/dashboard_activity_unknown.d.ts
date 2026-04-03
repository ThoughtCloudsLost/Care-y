/**
* | output |
* | --- |
* | "Activity" |
*
* @param {Dashboard_Activity_UnknownInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_unknown: ((inputs?: Dashboard_Activity_UnknownInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Activity_UnknownInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Activity_UnknownInputs = {};

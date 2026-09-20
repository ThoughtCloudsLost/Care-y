/**
* | output |
* | --- |
* | "Activity" |
*
* @param {Dashboard_Activity_UnknownInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_unknown: ((inputs?: Dashboard_Activity_UnknownInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Activity_UnknownInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Activity_UnknownInputs = {};

/**
* | output |
* | --- |
* | "Organization changes" |
*
* @param {Dashboard_Activity_Kind_OrgInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_kind_org: ((inputs?: Dashboard_Activity_Kind_OrgInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Activity_Kind_OrgInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Activity_Kind_OrgInputs = {};

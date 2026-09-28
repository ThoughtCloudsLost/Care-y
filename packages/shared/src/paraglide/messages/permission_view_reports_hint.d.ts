/**
* | output |
* | --- |
* | "Also opens the call history, which covers every call the organization handled across all queues." |
*
* @param {Permission_View_Reports_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_view_reports_hint: ((inputs?: Permission_View_Reports_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_View_Reports_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_View_Reports_HintInputs = {};

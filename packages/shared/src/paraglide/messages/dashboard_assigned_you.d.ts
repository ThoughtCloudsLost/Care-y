/**
* | output |
* | --- |
* | "You" |
*
* @param {Dashboard_Assigned_YouInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_assigned_you: ((inputs?: Dashboard_Assigned_YouInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Assigned_YouInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Assigned_YouInputs = {};

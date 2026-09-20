/**
* | output |
* | --- |
* | "Unassigned" |
*
* @param {Dashboard_Assigned_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_assigned_unassigned: ((inputs?: Dashboard_Assigned_UnassignedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Assigned_UnassignedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Assigned_UnassignedInputs = {};

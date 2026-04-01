/**
* | output |
* | --- |
* | "Unassigned" |
*
* @param {Dashboard_Stat_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_stat_unassigned: ((inputs?: Dashboard_Stat_UnassignedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Stat_UnassignedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Stat_UnassignedInputs = {};

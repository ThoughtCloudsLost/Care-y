/**
* | output |
* | --- |
* | "Operations" |
*
* @param {Panel_Analytics_OperationsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_analytics_operations: ((inputs?: Panel_Analytics_OperationsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_Analytics_OperationsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_Analytics_OperationsInputs = {};

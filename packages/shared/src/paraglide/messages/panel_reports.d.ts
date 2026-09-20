/**
* | output |
* | --- |
* | "Reports" |
*
* @param {Panel_ReportsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_reports: ((inputs?: Panel_ReportsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_ReportsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_ReportsInputs = {};

/**
* | output |
* | --- |
* | "Urgent" |
*
* @param {Dashboard_Section_UrgentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_section_urgent: ((inputs?: Dashboard_Section_UrgentInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Section_UrgentInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Section_UrgentInputs = {};

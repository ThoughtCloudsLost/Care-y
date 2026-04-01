/**
* | output |
* | --- |
* | "Nothing here right now" |
*
* @param {Dashboard_Empty_SectionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_empty_section: ((inputs?: Dashboard_Empty_SectionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Empty_SectionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Empty_SectionInputs = {};

/**
* | output |
* | --- |
* | "Filter {section}" |
*
* @param {Dashboard_Section_FilterInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_section_filter: ((inputs: Dashboard_Section_FilterInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Section_FilterInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Section_FilterInputs = {
    section: NonNullable<unknown>;
};

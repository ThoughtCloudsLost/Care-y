/**
* | output |
* | --- |
* | "Surfaces the user's shift status, queue counts, recent activity, knowledge base updates, and merge candidates above four ticket lanes (Needs attention, My ti..." |
*
* @param {Demo_Section_Dashboard_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_dashboard_desc: ((inputs?: Demo_Section_Dashboard_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Dashboard_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Dashboard_DescInputs = {};

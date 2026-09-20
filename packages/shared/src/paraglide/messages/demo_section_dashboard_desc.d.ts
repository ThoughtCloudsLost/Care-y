/**
* | output |
* | --- |
* | "The home screen after sign-in. Collapsible cards show shift status, ticket counts per queue, recent activity, knowledge base updates, and merge candidates. A..." |
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

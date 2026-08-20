/**
* | output |
* | --- |
* | "The dashboard is the home screen after login. It shows the volunteer's current shift, ticket counts per queue, recent activity, and quick access to knowledge..." |
*
* @param {Demo_Section_Dashboard_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_dashboard_desc: ((inputs?: Demo_Section_Dashboard_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Dashboard_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Dashboard_DescInputs = {};

/**
* | output |
* | --- |
* | "The home screen shows recent activity and queue counts. The activity feed and statistics pull real data from the in-browser database. The shift summary card ..." |
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

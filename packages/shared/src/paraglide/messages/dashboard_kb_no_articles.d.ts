/**
* | output |
* | --- |
* | "No recent articles" |
*
* @param {Dashboard_Kb_No_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_kb_no_articles: ((inputs?: Dashboard_Kb_No_ArticlesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Kb_No_ArticlesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Kb_No_ArticlesInputs = {};

/**
* | output |
* | --- |
* | "Publish an article" |
*
* @param {Demo_Guide_Publish_Kb_Article_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_publish_kb_article_title: ((inputs?: Demo_Guide_Publish_Kb_Article_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Guide_Publish_Kb_Article_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Guide_Publish_Kb_Article_TitleInputs = {};

/**
* | output |
* | --- |
* | "Delete articles" |
*
* @param {Permission_Delete_Knowledge_Base_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_delete_knowledge_base_articles: ((inputs?: Permission_Delete_Knowledge_Base_ArticlesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Delete_Knowledge_Base_ArticlesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Delete_Knowledge_Base_ArticlesInputs = {};

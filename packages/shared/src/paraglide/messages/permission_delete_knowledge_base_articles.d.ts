/**
* | output |
* | --- |
* | "Delete knowledge base articles" |
*
* @param {Permission_Delete_Knowledge_Base_ArticlesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_delete_knowledge_base_articles: ((inputs?: Permission_Delete_Knowledge_Base_ArticlesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Delete_Knowledge_Base_ArticlesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Delete_Knowledge_Base_ArticlesInputs = {};

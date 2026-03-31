/**
* | output |
* | --- |
* | "Category not found." |
*
* @param {Error_Kb_Category_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_kb_category_not_found: ((inputs?: Error_Kb_Category_Not_FoundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Kb_Category_Not_FoundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Kb_Category_Not_FoundInputs = {};

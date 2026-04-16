/**
* | output |
* | --- |
* | "Bullet list" |
*
* @param {Library_Editor_Bullet_ListInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_bullet_list: ((inputs?: Library_Editor_Bullet_ListInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_Bullet_ListInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_Bullet_ListInputs = {};

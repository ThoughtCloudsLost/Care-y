/**
* | output |
* | --- |
* | "Bullet list" |
*
* @param {Library_Editor_Bullet_ListInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_bullet_list: ((inputs?: Library_Editor_Bullet_ListInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_Bullet_ListInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_Bullet_ListInputs = {};

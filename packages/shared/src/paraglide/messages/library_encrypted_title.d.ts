/**
* | output |
* | --- |
* | "Article" |
*
* @param {Library_Encrypted_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_encrypted_title: ((inputs?: Library_Encrypted_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Encrypted_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Encrypted_TitleInputs = {};

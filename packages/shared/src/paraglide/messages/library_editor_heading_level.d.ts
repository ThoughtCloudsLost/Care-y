/**
* | output |
* | --- |
* | "Heading {level}" |
*
* @param {Library_Editor_Heading_LevelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_heading_level: ((inputs: Library_Editor_Heading_LevelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_Heading_LevelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_Heading_LevelInputs = {
    level: NonNullable<unknown>;
};

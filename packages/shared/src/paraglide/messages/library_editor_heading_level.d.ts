/**
* | output |
* | --- |
* | "Heading {level}" |
*
* @param {Library_Editor_Heading_LevelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_heading_level: ((inputs: Library_Editor_Heading_LevelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_Heading_LevelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_Heading_LevelInputs = {
    level: NonNullable<unknown>;
};

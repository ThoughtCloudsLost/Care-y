/**
* | output |
* | --- |
* | "The rich text editor supports headings (four levels), bold, italic, strikethrough, inline code, blockquotes, bullet lists, ordered lists, code blocks, links,..." |
*
* @param {Demo_Narrative_Topic_Library_Editor_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_editor_body: ((inputs?: Demo_Narrative_Topic_Library_Editor_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Library_Editor_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Library_Editor_BodyInputs = {};

/**
* | output |
* | --- |
* | "\"{text}\" is not descriptive for screen reader users. Use text that describes where the link goes." |
*
* @param {Library_Editor_Link_Generic_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_link_generic_warning: ((inputs: Library_Editor_Link_Generic_WarningInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_Link_Generic_WarningInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_Link_Generic_WarningInputs = {
    text: NonNullable<unknown>;
};

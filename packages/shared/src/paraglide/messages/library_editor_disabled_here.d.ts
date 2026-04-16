/**
* | output |
* | --- |
* | "Move your cursor to a regular paragraph to use {action}." |
*
* @param {Library_Editor_Disabled_HereInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_disabled_here: ((inputs: Library_Editor_Disabled_HereInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_Disabled_HereInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_Disabled_HereInputs = {
    action: NonNullable<unknown>;
};

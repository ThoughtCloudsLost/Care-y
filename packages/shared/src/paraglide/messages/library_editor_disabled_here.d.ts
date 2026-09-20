/**
* | output |
* | --- |
* | "Move your cursor to a regular paragraph to use {action}." |
*
* @param {Library_Editor_Disabled_HereInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_disabled_here: ((inputs: Library_Editor_Disabled_HereInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Editor_Disabled_HereInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Editor_Disabled_HereInputs = {
    action: NonNullable<unknown>;
};

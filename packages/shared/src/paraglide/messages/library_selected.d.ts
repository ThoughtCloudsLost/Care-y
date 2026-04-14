/**
* | output |
* | --- |
* | "{count} selected" |
*
* @param {Library_SelectedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_selected: ((inputs: Library_SelectedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_SelectedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_SelectedInputs = {
    count: NonNullable<unknown>;
};

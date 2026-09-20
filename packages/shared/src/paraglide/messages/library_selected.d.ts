/**
* | output |
* | --- |
* | "{count} selected" |
*
* @param {Library_SelectedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_selected: ((inputs: Library_SelectedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_SelectedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_SelectedInputs = {
    count: NonNullable<unknown>;
};

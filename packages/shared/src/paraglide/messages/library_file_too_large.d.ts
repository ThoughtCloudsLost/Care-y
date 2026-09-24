/**
* | output |
* | --- |
* | "File must be under 10 MB" |
*
* @param {Library_File_Too_LargeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_file_too_large: ((inputs?: Library_File_Too_LargeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_File_Too_LargeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_File_Too_LargeInputs = {};

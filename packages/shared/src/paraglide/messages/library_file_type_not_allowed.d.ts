/**
* | output |
* | --- |
* | "This file type is not supported" |
*
* @param {Library_File_Type_Not_AllowedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_file_type_not_allowed: ((inputs?: Library_File_Type_Not_AllowedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_File_Type_Not_AllowedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_File_Type_Not_AllowedInputs = {};

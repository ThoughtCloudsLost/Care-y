/**
* | output |
* | --- |
* | "Missing alt text" |
*
* @param {Library_Image_Missing_AltInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_image_missing_alt: ((inputs?: Library_Image_Missing_AltInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Image_Missing_AltInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Image_Missing_AltInputs = {};

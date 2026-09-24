/**
* | output |
* | --- |
* | "Missing alt text" |
*
* @param {Library_Image_Missing_AltInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_image_missing_alt: ((inputs?: Library_Image_Missing_AltInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Image_Missing_AltInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Image_Missing_AltInputs = {};

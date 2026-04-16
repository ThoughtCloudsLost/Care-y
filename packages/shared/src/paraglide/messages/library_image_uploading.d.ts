/**
* | output |
* | --- |
* | "Uploading image..." |
*
* @param {Library_Image_UploadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_image_uploading: ((inputs?: Library_Image_UploadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Image_UploadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Image_UploadingInputs = {};

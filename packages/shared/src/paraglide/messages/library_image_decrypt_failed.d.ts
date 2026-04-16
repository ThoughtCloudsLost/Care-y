/**
* | output |
* | --- |
* | "Image could not be loaded" |
*
* @param {Library_Image_Decrypt_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_image_decrypt_failed: ((inputs?: Library_Image_Decrypt_FailedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Image_Decrypt_FailedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Image_Decrypt_FailedInputs = {};

/**
* | output |
* | --- |
* | "Image upload failed" |
*
* @param {Library_Image_Upload_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_image_upload_failed: ((inputs?: Library_Image_Upload_FailedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Image_Upload_FailedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Image_Upload_FailedInputs = {};

/**
* | output |
* | --- |
* | "Image upload requires the organization key to be loaded" |
*
* @param {Form_Content_Editor_Image_No_KeyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const form_content_editor_image_no_key: ((inputs?: Form_Content_Editor_Image_No_KeyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Form_Content_Editor_Image_No_KeyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Form_Content_Editor_Image_No_KeyInputs = {};

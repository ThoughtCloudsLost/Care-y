/**
* | output |
* | --- |
* | "Images" |
*
* @param {Portal_Filter_ImagesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_filter_images: ((inputs?: Portal_Filter_ImagesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Filter_ImagesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Filter_ImagesInputs = {};

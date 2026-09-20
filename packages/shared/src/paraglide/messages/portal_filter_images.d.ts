/**
* | output |
* | --- |
* | "Images" |
*
* @param {Portal_Filter_ImagesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_filter_images: ((inputs?: Portal_Filter_ImagesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Filter_ImagesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Filter_ImagesInputs = {};

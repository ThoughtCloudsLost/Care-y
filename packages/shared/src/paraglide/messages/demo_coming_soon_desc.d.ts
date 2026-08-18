/**
* | output |
* | --- |
* | "This screen is part of the full application, but its documentation has not been written yet." |
*
* @param {Demo_Coming_Soon_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_coming_soon_desc: ((inputs?: Demo_Coming_Soon_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Coming_Soon_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Coming_Soon_DescInputs = {};

/**
* | output |
* | --- |
* | "Contents" |
*
* @param {Demo_ContentsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_contents: ((inputs?: Demo_ContentsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_ContentsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_ContentsInputs = {};

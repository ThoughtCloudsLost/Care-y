/**
* | output |
* | --- |
* | "Explore freely" |
*
* @param {Demo_Coming_Soon_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_coming_soon_heading: ((inputs?: Demo_Coming_Soon_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Coming_Soon_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Coming_Soon_HeadingInputs = {};

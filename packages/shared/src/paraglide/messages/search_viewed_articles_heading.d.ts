/**
* | output |
* | --- |
* | "Viewed articles" |
*
* @param {Search_Viewed_Articles_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_viewed_articles_heading: ((inputs?: Search_Viewed_Articles_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Viewed_Articles_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Viewed_Articles_HeadingInputs = {};

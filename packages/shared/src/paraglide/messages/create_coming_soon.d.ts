/**
* | output |
* | --- |
* | "Coming soon" |
*
* @param {Create_Coming_SoonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const create_coming_soon: ((inputs?: Create_Coming_SoonInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Create_Coming_SoonInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Create_Coming_SoonInputs = {};

/**
* | output |
* | --- |
* | "Phone and story are linked (click to unlink)" |
*
* @param {Demo_Toolbar_Link_LinkedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_link_linked: ((inputs?: Demo_Toolbar_Link_LinkedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Toolbar_Link_LinkedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Toolbar_Link_LinkedInputs = {};

/**
* | output |
* | --- |
* | "Phone and story are unlinked (click to relink)" |
*
* @param {Demo_Toolbar_Link_UnlinkedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_link_unlinked: ((inputs?: Demo_Toolbar_Link_UnlinkedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Toolbar_Link_UnlinkedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Toolbar_Link_UnlinkedInputs = {};

/**
* | output |
* | --- |
* | "Incomplete link" |
*
* @param {Portal_Incomplete_Link_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_incomplete_link_title: ((inputs?: Portal_Incomplete_Link_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Incomplete_Link_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Incomplete_Link_TitleInputs = {};

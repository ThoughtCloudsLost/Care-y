/**
* | output |
* | --- |
* | "Blocklist" |
*
* @param {Panel_BlocklistInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_blocklist: ((inputs?: Panel_BlocklistInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_BlocklistInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_BlocklistInputs = {};

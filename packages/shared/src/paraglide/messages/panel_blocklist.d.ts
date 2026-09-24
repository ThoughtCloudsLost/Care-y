/**
* | output |
* | --- |
* | "Blocklist" |
*
* @param {Panel_BlocklistInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_blocklist: ((inputs?: Panel_BlocklistInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_BlocklistInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_BlocklistInputs = {};

/**
* | output |
* | --- |
* | "Blacklist" |
*
* @param {Panel_BlacklistInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_blacklist: ((inputs?: Panel_BlacklistInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_BlacklistInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_BlacklistInputs = {};

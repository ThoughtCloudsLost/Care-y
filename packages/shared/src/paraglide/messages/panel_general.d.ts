/**
* | output |
* | --- |
* | "General" |
*
* @param {Panel_GeneralInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_general: ((inputs?: Panel_GeneralInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_GeneralInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_GeneralInputs = {};

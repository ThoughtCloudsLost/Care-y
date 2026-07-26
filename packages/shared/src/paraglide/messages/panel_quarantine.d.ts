/**
* | output |
* | --- |
* | "Unrouted Voicemails" |
*
* @param {Panel_QuarantineInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_quarantine: ((inputs?: Panel_QuarantineInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_QuarantineInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_QuarantineInputs = {};

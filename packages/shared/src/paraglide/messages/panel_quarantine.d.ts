/**
* | output |
* | --- |
* | "Unrouted Voicemails" |
*
* @param {Panel_QuarantineInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_quarantine: ((inputs?: Panel_QuarantineInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_QuarantineInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_QuarantineInputs = {};

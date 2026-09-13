/**
* | output |
* | --- |
* | "Call Log" |
*
* @param {Panel_Call_LogInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_call_log: ((inputs?: Panel_Call_LogInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_Call_LogInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_Call_LogInputs = {};

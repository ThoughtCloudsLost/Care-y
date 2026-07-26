/**
* | output |
* | --- |
* | "9:41" |
*
* @param {Demo_Status_Bar_TimeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_status_bar_time: ((inputs?: Demo_Status_Bar_TimeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Status_Bar_TimeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Status_Bar_TimeInputs = {};

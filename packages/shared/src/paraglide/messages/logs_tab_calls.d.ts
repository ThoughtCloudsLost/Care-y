/**
* | output |
* | --- |
* | "Calls" |
*
* @param {Logs_Tab_CallsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_tab_calls: ((inputs?: Logs_Tab_CallsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Tab_CallsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Tab_CallsInputs = {};

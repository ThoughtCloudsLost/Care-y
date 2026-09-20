/**
* | output |
* | --- |
* | "No calls found" |
*
* @param {Logs_Calls_Empty_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_calls_empty_title: ((inputs?: Logs_Calls_Empty_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Calls_Empty_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Calls_Empty_TitleInputs = {};

/**
* | output |
* | --- |
* | "Direction" |
*
* @param {Logs_Filter_DirectionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_filter_direction: ((inputs?: Logs_Filter_DirectionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Filter_DirectionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Filter_DirectionInputs = {};

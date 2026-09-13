/**
* | output |
* | --- |
* | "Direction" |
*
* @param {Logs_Filter_DirectionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_filter_direction: ((inputs?: Logs_Filter_DirectionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Logs_Filter_DirectionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Logs_Filter_DirectionInputs = {};

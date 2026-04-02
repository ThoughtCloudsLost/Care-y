/**
* | output |
* | --- |
* | "(you)" |
*
* @param {Dashboard_Shift_YouInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_you: ((inputs?: Dashboard_Shift_YouInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Shift_YouInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Shift_YouInputs = {};

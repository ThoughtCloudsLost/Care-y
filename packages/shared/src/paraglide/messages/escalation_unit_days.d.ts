/**
* | output |
* | --- |
* | "Days" |
*
* @param {Escalation_Unit_DaysInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_unit_days: ((inputs?: Escalation_Unit_DaysInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Unit_DaysInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Unit_DaysInputs = {};

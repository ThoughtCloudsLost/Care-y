/**
* | output |
* | --- |
* | "Hours" |
*
* @param {Escalation_Unit_HoursInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_unit_hours: ((inputs?: Escalation_Unit_HoursInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Unit_HoursInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Unit_HoursInputs = {};

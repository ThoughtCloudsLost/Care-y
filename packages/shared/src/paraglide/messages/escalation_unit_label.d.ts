/**
* | output |
* | --- |
* | "Unit" |
*
* @param {Escalation_Unit_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_unit_label: ((inputs?: Escalation_Unit_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Unit_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Unit_LabelInputs = {};

/**
* | output |
* | --- |
* | "Escalation rule updated." |
*
* @param {Escalation_Rule_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_rule_updated: ((inputs?: Escalation_Rule_UpdatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Rule_UpdatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Rule_UpdatedInputs = {};

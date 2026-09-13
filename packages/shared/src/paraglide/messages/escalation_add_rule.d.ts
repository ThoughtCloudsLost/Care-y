/**
* | output |
* | --- |
* | "+ Add rule" |
*
* @param {Escalation_Add_RuleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_add_rule: ((inputs?: Escalation_Add_RuleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Add_RuleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Add_RuleInputs = {};

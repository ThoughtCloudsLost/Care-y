/**
* | output |
* | --- |
* | "Escalation rule created." |
*
* @param {Escalation_Rule_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_rule_created: ((inputs?: Escalation_Rule_CreatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Rule_CreatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Rule_CreatedInputs = {};

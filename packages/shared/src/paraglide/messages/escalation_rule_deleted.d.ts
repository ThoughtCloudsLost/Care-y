/**
* | output |
* | --- |
* | "Escalation rule deleted." |
*
* @param {Escalation_Rule_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const escalation_rule_deleted: ((inputs?: Escalation_Rule_DeletedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Rule_DeletedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Rule_DeletedInputs = {};

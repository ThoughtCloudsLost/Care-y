/**
* | output |
* | --- |
* | "Add escalation rule" |
*
* @param {Escalation_Add_Form_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const escalation_add_form_label: ((inputs?: Escalation_Add_Form_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Escalation_Add_Form_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Escalation_Add_Form_LabelInputs = {};

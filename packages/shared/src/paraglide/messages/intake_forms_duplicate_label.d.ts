/**
* | output |
* | --- |
* | "Duplicate form" |
*
* @param {Intake_Forms_Duplicate_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_duplicate_label: ((inputs?: Intake_Forms_Duplicate_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Duplicate_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Duplicate_LabelInputs = {};

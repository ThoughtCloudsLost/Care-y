/**
* | output |
* | --- |
* | "How should we reach you?" |
*
* @param {Intake_Contact_Method_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_contact_method_label: ((inputs?: Intake_Contact_Method_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Contact_Method_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Contact_Method_LabelInputs = {};

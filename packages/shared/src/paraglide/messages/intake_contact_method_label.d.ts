/**
* | output |
* | --- |
* | "How should we reach you?" |
*
* @param {Intake_Contact_Method_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_contact_method_label: ((inputs?: Intake_Contact_Method_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Contact_Method_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Contact_Method_LabelInputs = {};

/**
* | output |
* | --- |
* | "Please enter your contact information." |
*
* @param {Intake_Error_Contact_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_contact_required: ((inputs?: Intake_Error_Contact_RequiredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Error_Contact_RequiredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Error_Contact_RequiredInputs = {};

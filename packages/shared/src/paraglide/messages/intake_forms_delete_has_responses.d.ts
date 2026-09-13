/**
* | output |
* | --- |
* | "This form has been used for intake submissions and cannot be deleted. You can deactivate it instead." |
*
* @param {Intake_Forms_Delete_Has_ResponsesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_delete_has_responses: ((inputs?: Intake_Forms_Delete_Has_ResponsesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Delete_Has_ResponsesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Delete_Has_ResponsesInputs = {};

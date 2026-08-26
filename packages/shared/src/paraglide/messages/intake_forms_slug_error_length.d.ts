/**
* | output |
* | --- |
* | "Slug must be 2 to 80 characters." |
*
* @param {Intake_Forms_Slug_Error_LengthInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_slug_error_length: ((inputs?: Intake_Forms_Slug_Error_LengthInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Slug_Error_LengthInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Slug_Error_LengthInputs = {};

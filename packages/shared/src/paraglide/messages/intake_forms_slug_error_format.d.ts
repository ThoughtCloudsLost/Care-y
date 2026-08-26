/**
* | output |
* | --- |
* | "Lowercase letters, digits, and single hyphens only. Must start and end with a letter or digit." |
*
* @param {Intake_Forms_Slug_Error_FormatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_slug_error_format: ((inputs?: Intake_Forms_Slug_Error_FormatInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Slug_Error_FormatInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Slug_Error_FormatInputs = {};

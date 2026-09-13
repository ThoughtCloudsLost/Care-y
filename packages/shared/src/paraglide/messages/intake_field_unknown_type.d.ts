/**
* | output |
* | --- |
* | "This field type is not supported by your version of the form." |
*
* @param {Intake_Field_Unknown_TypeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_field_unknown_type: ((inputs?: Intake_Field_Unknown_TypeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Field_Unknown_TypeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Field_Unknown_TypeInputs = {};

/**
* | output |
* | --- |
* | "{count} fields" |
*
* @param {Intake_Forms_Field_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_count: ((inputs: Intake_Forms_Field_CountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_CountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_CountInputs = {
    count: NonNullable<unknown>;
};

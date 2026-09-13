/**
* | output |
* | --- |
* | "Fields ({count})" |
*
* @param {Intake_Forms_Fields_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_fields_heading: ((inputs: Intake_Forms_Fields_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Fields_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Fields_HeadingInputs = {
    count: NonNullable<unknown>;
};

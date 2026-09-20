/**
* | output |
* | --- |
* | "Fields ({count})" |
*
* @param {Intake_Forms_Fields_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_fields_heading: ((inputs: Intake_Forms_Fields_HeadingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Fields_HeadingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Fields_HeadingInputs = {
    count: NonNullable<unknown>;
};

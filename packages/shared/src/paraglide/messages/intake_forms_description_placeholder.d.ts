/**
* | output |
* | --- |
* | "Shown above the form instead of the default intro text." |
*
* @param {Intake_Forms_Description_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_description_placeholder: ((inputs?: Intake_Forms_Description_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Description_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Description_PlaceholderInputs = {};

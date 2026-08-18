/**
* | output |
* | --- |
* | "e.g. Main Intake" |
*
* @param {Intake_Forms_Name_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_name_placeholder: ((inputs?: Intake_Forms_Name_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Name_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Name_PlaceholderInputs = {};

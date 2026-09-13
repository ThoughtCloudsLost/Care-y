/**
* | output |
* | --- |
* | "Inactive" |
*
* @param {Intake_Forms_InactiveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_inactive: ((inputs?: Intake_Forms_InactiveInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_InactiveInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_InactiveInputs = {};

/**
* | output |
* | --- |
* | "Form deactivated" |
*
* @param {Intake_Forms_DeactivatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_deactivated: ((inputs?: Intake_Forms_DeactivatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_DeactivatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_DeactivatedInputs = {};

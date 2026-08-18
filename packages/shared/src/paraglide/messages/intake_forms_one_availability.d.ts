/**
* | output |
* | --- |
* | "One availability field per form." |
*
* @param {Intake_Forms_One_AvailabilityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_one_availability: ((inputs?: Intake_Forms_One_AvailabilityInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_One_AvailabilityInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_One_AvailabilityInputs = {};

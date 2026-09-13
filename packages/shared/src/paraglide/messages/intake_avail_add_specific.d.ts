/**
* | output |
* | --- |
* | "Add specific date" |
*
* @param {Intake_Avail_Add_SpecificInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_add_specific: ((inputs?: Intake_Avail_Add_SpecificInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Avail_Add_SpecificInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Avail_Add_SpecificInputs = {};

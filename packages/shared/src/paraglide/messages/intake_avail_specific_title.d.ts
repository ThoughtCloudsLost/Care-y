/**
* | output |
* | --- |
* | "Specific dates" |
*
* @param {Intake_Avail_Specific_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_specific_title: ((inputs?: Intake_Avail_Specific_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Avail_Specific_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Avail_Specific_TitleInputs = {};

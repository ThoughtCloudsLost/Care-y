/**
* | output |
* | --- |
* | "Specific dates" |
*
* @param {Intake_Avail_Specific_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_specific_title: ((inputs?: Intake_Avail_Specific_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Avail_Specific_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Avail_Specific_TitleInputs = {};

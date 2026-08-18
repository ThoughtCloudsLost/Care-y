/**
* | output |
* | --- |
* | "Your rights" |
*
* @param {Intake_Privacy_Rights_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_rights_title: ((inputs?: Intake_Privacy_Rights_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Privacy_Rights_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Privacy_Rights_TitleInputs = {};

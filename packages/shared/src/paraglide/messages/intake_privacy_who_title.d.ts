/**
* | output |
* | --- |
* | "Who is collecting your data" |
*
* @param {Intake_Privacy_Who_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_who_title: ((inputs?: Intake_Privacy_Who_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Privacy_Who_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Privacy_Who_TitleInputs = {};

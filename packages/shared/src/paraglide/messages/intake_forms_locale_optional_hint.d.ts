/**
* | output |
* | --- |
* | "Translations are optional. Fields without a translation fall back to the English text." |
*
* @param {Intake_Forms_Locale_Optional_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_locale_optional_hint: ((inputs?: Intake_Forms_Locale_Optional_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Locale_Optional_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Locale_Optional_HintInputs = {};

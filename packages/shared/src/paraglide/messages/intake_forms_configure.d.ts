/**
* | output |
* | --- |
* | "Configure" |
*
* @param {Intake_Forms_ConfigureInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_configure: ((inputs?: Intake_Forms_ConfigureInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_ConfigureInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_ConfigureInputs = {};

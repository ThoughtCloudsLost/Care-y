/**
* | output |
* | --- |
* | "No forms yet. Create one to customize the intake page." |
*
* @param {Intake_Forms_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_empty: ((inputs?: Intake_Forms_EmptyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_EmptyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_EmptyInputs = {};

/**
* | output |
* | --- |
* | "Add banner image" |
*
* @param {Intake_Forms_Banner_AddInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_banner_add: ((inputs?: Intake_Forms_Banner_AddInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Banner_AddInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Banner_AddInputs = {};

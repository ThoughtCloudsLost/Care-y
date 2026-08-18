/**
* | output |
* | --- |
* | "At least one window type must be allowed." |
*
* @param {Intake_Forms_Config_At_Least_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_at_least_one: ((inputs?: Intake_Forms_Config_At_Least_OneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_At_Least_OneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_At_Least_OneInputs = {};

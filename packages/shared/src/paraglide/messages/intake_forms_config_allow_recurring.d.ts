/**
* | output |
* | --- |
* | "Allow weekly times" |
*
* @param {Intake_Forms_Config_Allow_RecurringInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_allow_recurring: ((inputs?: Intake_Forms_Config_Allow_RecurringInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Allow_RecurringInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Allow_RecurringInputs = {};

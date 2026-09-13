/**
* | output |
* | --- |
* | "Add weekly time" |
*
* @param {Intake_Avail_Add_RecurringInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_add_recurring: ((inputs?: Intake_Avail_Add_RecurringInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Avail_Add_RecurringInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Avail_Add_RecurringInputs = {};

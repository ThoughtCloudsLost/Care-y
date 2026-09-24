/**
* | output |
* | --- |
* | "Add weekly time" |
*
* @param {Intake_Avail_Add_RecurringInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_add_recurring: ((inputs?: Intake_Avail_Add_RecurringInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Avail_Add_RecurringInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Avail_Add_RecurringInputs = {};

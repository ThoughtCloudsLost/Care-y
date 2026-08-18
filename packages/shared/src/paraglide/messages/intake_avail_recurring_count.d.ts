/**
* | output |
* | --- |
* | "{count} of {max}" |
*
* @param {Intake_Avail_Recurring_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_recurring_count: ((inputs: Intake_Avail_Recurring_CountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Avail_Recurring_CountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Avail_Recurring_CountInputs = {
    count: NonNullable<unknown>;
    max: NonNullable<unknown>;
};

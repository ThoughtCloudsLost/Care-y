/**
* | output |
* | --- |
* | "Timezone: {timezone}" |
*
* @param {Intake_Avail_Timezone_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_timezone_label: ((inputs: Intake_Avail_Timezone_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Avail_Timezone_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Avail_Timezone_LabelInputs = {
    timezone: NonNullable<unknown>;
};

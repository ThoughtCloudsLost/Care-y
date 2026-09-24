/**
* | output |
* | --- |
* | "{count} of {max}" |
*
* @param {Intake_Avail_Specific_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_specific_count: ((inputs: Intake_Avail_Specific_CountInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Avail_Specific_CountInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Avail_Specific_CountInputs = {
    count: NonNullable<unknown>;
    max: NonNullable<unknown>;
};

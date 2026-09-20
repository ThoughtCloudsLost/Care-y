/**
* | output |
* | --- |
* | "Maximum reached." |
*
* @param {Intake_Avail_Max_ReachedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_avail_max_reached: ((inputs?: Intake_Avail_Max_ReachedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Avail_Max_ReachedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Avail_Max_ReachedInputs = {};

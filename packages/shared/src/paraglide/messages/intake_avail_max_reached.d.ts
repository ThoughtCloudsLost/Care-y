/**
* | output |
* | --- |
* | "Maximum reached." |
*
* @param {Intake_Avail_Max_ReachedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_avail_max_reached: ((inputs?: Intake_Avail_Max_ReachedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Avail_Max_ReachedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Avail_Max_ReachedInputs = {};

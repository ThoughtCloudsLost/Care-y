/**
* | output |
* | --- |
* | "{count} / {max}" |
*
* @param {Intake_Char_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_char_count: ((inputs: Intake_Char_CountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Char_CountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Char_CountInputs = {
    count: NonNullable<unknown>;
    max: NonNullable<unknown>;
};

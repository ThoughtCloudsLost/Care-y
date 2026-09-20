/**
* | output |
* | --- |
* | "Jump to {heading}" |
*
* @param {Demo_Chip_Jump_ToInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_chip_jump_to: ((inputs: Demo_Chip_Jump_ToInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Chip_Jump_ToInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Chip_Jump_ToInputs = {
    heading: NonNullable<unknown>;
};

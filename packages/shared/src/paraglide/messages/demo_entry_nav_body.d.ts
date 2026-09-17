/**
* | output |
* | --- |
* | "The contents menu in the top bar lists every handbook section, and clicking one jumps there. The simulator follows where the handbook goes, and tapping aroun..." |
*
* @param {Demo_Entry_Nav_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_nav_body: ((inputs?: Demo_Entry_Nav_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Entry_Nav_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Entry_Nav_BodyInputs = {};

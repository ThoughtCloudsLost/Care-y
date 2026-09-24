/**
* | output |
* | --- |
* | "New Shift" |
*
* @param {Create_New_ShiftInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const create_new_shift: ((inputs?: Create_New_ShiftInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Create_New_ShiftInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Create_New_ShiftInputs = {};

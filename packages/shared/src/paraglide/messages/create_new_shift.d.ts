/**
* | output |
* | --- |
* | "New Shift" |
*
* @param {Create_New_ShiftInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const create_new_shift: ((inputs?: Create_New_ShiftInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Create_New_ShiftInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Create_New_ShiftInputs = {};

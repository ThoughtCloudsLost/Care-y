/**
* | output |
* | --- |
* | "Manage your shifts" |
*
* @param {Vol_Access_ShiftsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_access_shifts: ((inputs?: Vol_Access_ShiftsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Vol_Access_ShiftsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Vol_Access_ShiftsInputs = {};

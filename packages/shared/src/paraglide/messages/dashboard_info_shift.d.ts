/**
* | output |
* | --- |
* | "Shift: {start} - {end}" |
*
* @param {Dashboard_Info_ShiftInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_info_shift: ((inputs: Dashboard_Info_ShiftInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Info_ShiftInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Info_ShiftInputs = {
    start: NonNullable<unknown>;
    end: NonNullable<unknown>;
};

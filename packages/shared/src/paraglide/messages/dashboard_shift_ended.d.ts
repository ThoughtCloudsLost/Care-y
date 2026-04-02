/**
* | output |
* | --- |
* | "Shift ended ({start} - {end})" |
*
* @param {Dashboard_Shift_EndedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_ended: ((inputs: Dashboard_Shift_EndedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Shift_EndedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Shift_EndedInputs = {
    start: NonNullable<unknown>;
    end: NonNullable<unknown>;
};

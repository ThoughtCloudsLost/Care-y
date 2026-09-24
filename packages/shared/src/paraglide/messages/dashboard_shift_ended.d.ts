/**
* | output |
* | --- |
* | "Shift ended ({start} - {end})" |
*
* @param {Dashboard_Shift_EndedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_ended: ((inputs: Dashboard_Shift_EndedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Shift_EndedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Shift_EndedInputs = {
    start: NonNullable<unknown>;
    end: NonNullable<unknown>;
};

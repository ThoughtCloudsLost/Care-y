/**
* | output |
* | --- |
* | "Ends in {time} ({start} - {end})" |
*
* @param {Dashboard_Shift_Ends_InInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_ends_in: ((inputs: Dashboard_Shift_Ends_InInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Shift_Ends_InInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Shift_Ends_InInputs = {
    time: NonNullable<unknown>;
    start: NonNullable<unknown>;
    end: NonNullable<unknown>;
};

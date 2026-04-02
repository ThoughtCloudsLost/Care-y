/**
* | output |
* | --- |
* | "Starts in {time} ({start} - {end})" |
*
* @param {Dashboard_Shift_Not_StartedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_not_started: ((inputs: Dashboard_Shift_Not_StartedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Shift_Not_StartedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Shift_Not_StartedInputs = {
    time: NonNullable<unknown>;
    start: NonNullable<unknown>;
    end: NonNullable<unknown>;
};

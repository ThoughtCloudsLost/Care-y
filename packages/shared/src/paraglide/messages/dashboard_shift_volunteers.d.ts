/**
* | output |
* | --- |
* | "{count} on shift" |
*
* @param {Dashboard_Shift_VolunteersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_volunteers: ((inputs: Dashboard_Shift_VolunteersInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Shift_VolunteersInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Shift_VolunteersInputs = {
    count: NonNullable<unknown>;
};

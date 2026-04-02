/**
* | output |
* | --- |
* | "{count} on shift" |
*
* @param {Dashboard_Info_Volunteers_On_ShiftInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_info_volunteers_on_shift: ((inputs: Dashboard_Info_Volunteers_On_ShiftInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Info_Volunteers_On_ShiftInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Info_Volunteers_On_ShiftInputs = {
    count: NonNullable<unknown>;
};

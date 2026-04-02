/**
* | output |
* | --- |
* | "{label}" |
*
* @param {Dashboard_Info_Shift_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_info_shift_label: ((inputs: Dashboard_Info_Shift_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Info_Shift_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Info_Shift_LabelInputs = {
    label: NonNullable<unknown>;
};

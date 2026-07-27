/**
* | output |
* | --- |
* | "{label}, {direction}" |
*
* @param {Sort_Button_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const sort_button_label: ((inputs: Sort_Button_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Sort_Button_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Sort_Button_LabelInputs = {
    label: NonNullable<unknown>;
    direction: NonNullable<unknown>;
};

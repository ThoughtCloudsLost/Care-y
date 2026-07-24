/**
* | output |
* | --- |
* | "View as" |
*
* @param {View_Switcher_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const view_switcher_label: ((inputs?: View_Switcher_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<View_Switcher_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type View_Switcher_LabelInputs = {};

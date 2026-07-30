/**
* | output |
* | --- |
* | "Drag to reposition" |
*
* @param {Demo_Toolbar_Grip_TooltipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_grip_tooltip: ((inputs?: Demo_Toolbar_Grip_TooltipInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Toolbar_Grip_TooltipInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Toolbar_Grip_TooltipInputs = {};

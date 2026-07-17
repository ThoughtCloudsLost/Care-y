/**
* | output |
* | --- |
* | "You are in: {area}" |
*
* @param {Nav_Area_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_area_label: ((inputs: Nav_Area_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Nav_Area_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Nav_Area_LabelInputs = {
    area: NonNullable<unknown>;
};

/**
* | output |
* | --- |
* | "You are in: {area}" |
*
* @param {Nav_Area_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const nav_area_label: ((inputs: Nav_Area_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Nav_Area_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Nav_Area_LabelInputs = {
    area: NonNullable<unknown>;
};

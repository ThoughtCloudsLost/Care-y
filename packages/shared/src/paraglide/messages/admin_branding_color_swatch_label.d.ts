/**
* | output |
* | --- |
* | "Color swatch {color}" |
*
* @param {Admin_Branding_Color_Swatch_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_color_swatch_label: ((inputs: Admin_Branding_Color_Swatch_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Branding_Color_Swatch_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Branding_Color_Swatch_LabelInputs = {
    color: NonNullable<unknown>;
};

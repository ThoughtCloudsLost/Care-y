/**
* | output |
* | --- |
* | "Wrapping key for {count} volunteers..." |
*
* @param {Admin_Rotation_WrappingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_wrapping: ((inputs: Admin_Rotation_WrappingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Rotation_WrappingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Rotation_WrappingInputs = {
    count: NonNullable<unknown>;
};

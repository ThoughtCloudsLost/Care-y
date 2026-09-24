/**
* | output |
* | --- |
* | "Securing records: {done} of {total}..." |
*
* @param {Admin_Rotation_ResealingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_resealing: ((inputs: Admin_Rotation_ResealingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Rotation_ResealingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Rotation_ResealingInputs = {
    done: NonNullable<unknown>;
    total: NonNullable<unknown>;
};

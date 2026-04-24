/**
* | output |
* | --- |
* | "Current password" |
*
* @param {Settings_Password_Recovery_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_recovery_label: ((inputs?: Settings_Password_Recovery_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Settings_Password_Recovery_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Settings_Password_Recovery_LabelInputs = {};

/**
* | output |
* | --- |
* | "Are you sure you want to remove this saved reply? {Volunteers} will no longer see it in the compose bar." |
*
* @param {Admin_Presets_Delete_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_presets_delete_confirm: ((inputs: Admin_Presets_Delete_ConfirmInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Presets_Delete_ConfirmInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Presets_Delete_ConfirmInputs = {
    Volunteers: NonNullable<unknown>;
};

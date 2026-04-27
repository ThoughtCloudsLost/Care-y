/**
* | output |
* | --- |
* | "This creates a new encryption key for your organization's shared data: volunteer names, knowledge base articles, queue names, and organization branding. All ..." |
*
* @param {Admin_Rotation_Dialog_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_dialog_body: ((inputs: Admin_Rotation_Dialog_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Rotation_Dialog_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Rotation_Dialog_BodyInputs = {
    count: NonNullable<unknown>;
};

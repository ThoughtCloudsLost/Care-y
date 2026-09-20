/**
* | output |
* | --- |
* | "Closed {tickets} with no activity for more than {days} days will be permanently deleted, along with their messages, files, and caller personal information. P..." |
*
* @param {Admin_Retention_Set_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_set_body: ((inputs: Admin_Retention_Set_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Retention_Set_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Retention_Set_BodyInputs = {
    tickets: NonNullable<unknown>;
    days: NonNullable<unknown>;
};

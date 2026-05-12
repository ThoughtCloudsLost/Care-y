/**
* | output |
* | --- |
* | "{Tickets}, messages, and caller personal information older than {days} days will be permanently and automatically deleted. This cannot be undone. Deleted dat..." |
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
    Tickets: NonNullable<unknown>;
    days: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};

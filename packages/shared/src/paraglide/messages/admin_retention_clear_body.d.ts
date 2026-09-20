/**
* | output |
* | --- |
* | "Closed {tickets} and caller personal information will be kept indefinitely until manually deleted." |
*
* @param {Admin_Retention_Clear_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_retention_clear_body: ((inputs: Admin_Retention_Clear_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Retention_Clear_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Retention_Clear_BodyInputs = {
    tickets: NonNullable<unknown>;
};

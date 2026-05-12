/**
* | output |
* | --- |
* | "{Queue} names appear in email notifications sent to {volunteers}. Use functional names like \"General Intake\" or \"Evening Line\" rather than names that could i..." |
*
* @param {Admin_Queue_Editor_Pii_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_pii_warning: ((inputs: Admin_Queue_Editor_Pii_WarningInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Editor_Pii_WarningInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Editor_Pii_WarningInputs = {
    Queue: NonNullable<unknown>;
    volunteers: NonNullable<unknown>;
    queues: NonNullable<unknown>;
};

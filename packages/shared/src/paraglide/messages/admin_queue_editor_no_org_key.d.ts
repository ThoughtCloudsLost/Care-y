/**
* | output |
* | --- |
* | "Organization key not loaded. Cannot create or edit {queues}." |
*
* @param {Admin_Queue_Editor_No_Org_KeyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_editor_no_org_key: ((inputs: Admin_Queue_Editor_No_Org_KeyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Editor_No_Org_KeyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Editor_No_Org_KeyInputs = {
    queues: NonNullable<unknown>;
};

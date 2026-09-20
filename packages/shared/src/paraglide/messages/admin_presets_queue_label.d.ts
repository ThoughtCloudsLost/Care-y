/**
* | output |
* | --- |
* | "{Queue} (optional)" |
*
* @param {Admin_Presets_Queue_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_presets_queue_label: ((inputs: Admin_Presets_Queue_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Presets_Queue_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Presets_Queue_LabelInputs = {
    Queue: NonNullable<unknown>;
};

/**
* | output |
* | --- |
* | "All {queues}" |
*
* @param {Admin_Presets_Queue_GlobalInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_presets_queue_global: ((inputs: Admin_Presets_Queue_GlobalInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Presets_Queue_GlobalInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Presets_Queue_GlobalInputs = {
    queues: NonNullable<unknown>;
};

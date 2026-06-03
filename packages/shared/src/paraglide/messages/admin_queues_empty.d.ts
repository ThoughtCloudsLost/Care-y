/**
* | output |
* | --- |
* | "No {queues} yet. Create one to start routing {tickets}." |
*
* @param {Admin_Queues_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_empty: ((inputs: Admin_Queues_EmptyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queues_EmptyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queues_EmptyInputs = {
    queues: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
};

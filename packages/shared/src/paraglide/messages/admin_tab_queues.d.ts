/**
* | output |
* | --- |
* | "{Queues}" |
*
* @param {Admin_Tab_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_tab_queues: ((inputs: Admin_Tab_QueuesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Tab_QueuesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Tab_QueuesInputs = {
    Queues: NonNullable<unknown>;
};

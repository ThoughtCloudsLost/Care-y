/**
* | output |
* | --- |
* | "{Queues}" |
*
* @param {Admin_Tab_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_queues: ((inputs: Admin_Tab_QueuesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Tab_QueuesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Tab_QueuesInputs = {
    Queues: NonNullable<unknown>;
};

/**
* | output |
* | --- |
* | "{count} queues" |
*
* @param {Admin_Hub_Badge_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_queues: ((inputs: Admin_Hub_Badge_QueuesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Hub_Badge_QueuesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Hub_Badge_QueuesInputs = {
    count: NonNullable<unknown>;
};

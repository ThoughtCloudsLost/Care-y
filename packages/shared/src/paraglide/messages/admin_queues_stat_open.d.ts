/**
* | output |
* | --- |
* | "{count} open" |
*
* @param {Admin_Queues_Stat_OpenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queues_stat_open: ((inputs: Admin_Queues_Stat_OpenInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queues_Stat_OpenInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queues_Stat_OpenInputs = {
    count: NonNullable<unknown>;
};

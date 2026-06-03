/**
* | output |
* | --- |
* | "{count} {queues}" |
*
* @param {Admin_Queues_Stat_TotalInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queues_stat_total: ((inputs: Admin_Queues_Stat_TotalInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queues_Stat_TotalInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queues_Stat_TotalInputs = {
    count: NonNullable<unknown>;
    queues: NonNullable<unknown>;
};

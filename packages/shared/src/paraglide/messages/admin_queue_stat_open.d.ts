/**
* | output |
* | --- |
* | "{count} open" |
*
* @param {Admin_Queue_Stat_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_stat_open: ((inputs: Admin_Queue_Stat_OpenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Stat_OpenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Stat_OpenInputs = {
    count: NonNullable<unknown>;
};

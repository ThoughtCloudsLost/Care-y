/**
* | output |
* | --- |
* | "{count} hold" |
*
* @param {Admin_Queue_Stat_HoldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_stat_hold: ((inputs: Admin_Queue_Stat_HoldInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Stat_HoldInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Stat_HoldInputs = {
    count: NonNullable<unknown>;
};

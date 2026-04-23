/**
* | output |
* | --- |
* | "{count} closed" |
*
* @param {Admin_Queue_Stat_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_stat_closed: ((inputs: Admin_Queue_Stat_ClosedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Stat_ClosedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Stat_ClosedInputs = {
    count: NonNullable<unknown>;
};

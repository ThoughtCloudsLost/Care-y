/**
* | output |
* | --- |
* | "{Queue} fund updated" |
*
* @param {Admin_Queue_Fund_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_fund_saved: ((inputs: Admin_Queue_Fund_SavedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Fund_SavedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Fund_SavedInputs = {
    Queue: NonNullable<unknown>;
    queue: NonNullable<unknown>;
};

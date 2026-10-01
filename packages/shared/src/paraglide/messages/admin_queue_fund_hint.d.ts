/**
* | output |
* | --- |
* | "New disbursements on {tickets} in this {queue} start with this fund selected. {Volunteers} can still choose another." |
*
* @param {Admin_Queue_Fund_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_fund_hint: ((inputs: Admin_Queue_Fund_HintInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Fund_HintInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Fund_HintInputs = {
    tickets: NonNullable<unknown>;
    queue: NonNullable<unknown>;
    Volunteers: NonNullable<unknown>;
    volunteers: NonNullable<unknown>;
};

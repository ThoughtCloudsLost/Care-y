/**
* | output |
* | --- |
* | "Watchers are notified about new activity in this {queue} but do not receive read access to its {tickets}. Members, by contrast, can read every {ticket} in th..." |
*
* @param {Admin_Queue_Watchers_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_watchers_hint: ((inputs: Admin_Queue_Watchers_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Queue_Watchers_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Queue_Watchers_HintInputs = {
    queue: NonNullable<unknown>;
    tickets: NonNullable<unknown>;
    ticket: NonNullable<unknown>;
};

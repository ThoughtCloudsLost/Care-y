/**
* | output |
* | --- |
* | "{count} msg" |
*
* @param {Ticket_Meta_Msg_Count_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_meta_msg_count_one: ((inputs: Ticket_Meta_Msg_Count_OneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Meta_Msg_Count_OneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Meta_Msg_Count_OneInputs = {
    count: NonNullable<unknown>;
};

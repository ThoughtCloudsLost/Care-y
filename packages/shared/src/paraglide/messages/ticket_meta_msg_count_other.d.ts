/**
* | output |
* | --- |
* | "{count} msgs" |
*
* @param {Ticket_Meta_Msg_Count_OtherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_meta_msg_count_other: ((inputs: Ticket_Meta_Msg_Count_OtherInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Meta_Msg_Count_OtherInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Meta_Msg_Count_OtherInputs = {
    count: NonNullable<unknown>;
};

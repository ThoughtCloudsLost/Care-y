/**
* | output |
* | --- |
* | "When a {client} writes back, their {ticket} shows up here." |
*
* @param {Tickets_Unread_Zero_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_unread_zero_body: ((inputs: Tickets_Unread_Zero_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Unread_Zero_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Unread_Zero_BodyInputs = {
    client: NonNullable<unknown>;
    ticket: NonNullable<unknown>;
};

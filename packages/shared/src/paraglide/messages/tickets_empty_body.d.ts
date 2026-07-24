/**
* | output |
* | --- |
* | "When a {client} reaches out, their {ticket} shows up here." |
*
* @param {Tickets_Empty_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_empty_body: ((inputs: Tickets_Empty_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Empty_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Empty_BodyInputs = {
    client: NonNullable<unknown>;
    ticket: NonNullable<unknown>;
};

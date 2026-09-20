/**
* | output |
* | --- |
* | "Open {ticket} {alias}" |
*
* @param {Tickets_OpenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_open: ((inputs: Tickets_OpenInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_OpenInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_OpenInputs = {
    ticket: NonNullable<unknown>;
    alias: NonNullable<unknown>;
};

/**
* | output |
* | --- |
* | "{current} of {total}" |
*
* @param {Ticket_Close_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_close_progress: ((inputs: Ticket_Close_ProgressInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Close_ProgressInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Close_ProgressInputs = {
    current: NonNullable<unknown>;
    total: NonNullable<unknown>;
};

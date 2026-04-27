/**
* | output |
* | --- |
* | "{current} of {total}" |
*
* @param {Ticket_Close_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_close_progress: ((inputs: Ticket_Close_ProgressInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Close_ProgressInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Close_ProgressInputs = {
    current: NonNullable<unknown>;
    total: NonNullable<unknown>;
};

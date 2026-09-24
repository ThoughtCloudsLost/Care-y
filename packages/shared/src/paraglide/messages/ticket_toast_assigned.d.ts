/**
* | output |
* | --- |
* | "Assigned to {name}" |
*
* @param {Ticket_Toast_AssignedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_assigned: ((inputs: Ticket_Toast_AssignedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_AssignedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_AssignedInputs = {
    name: NonNullable<unknown>;
};

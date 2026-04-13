/**
* | output |
* | --- |
* | "Assigned to {name}" |
*
* @param {Ticket_Toast_AssignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_assigned: ((inputs: Ticket_Toast_AssignedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_AssignedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_AssignedInputs = {
    name: NonNullable<unknown>;
};

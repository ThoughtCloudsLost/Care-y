/**
* | output |
* | --- |
* | "{count} tickets assigned to {name}" |
*
* @param {Ticket_Toast_Bulk_AssignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_bulk_assigned: ((inputs: Ticket_Toast_Bulk_AssignedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_Bulk_AssignedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_Bulk_AssignedInputs = {
    count: NonNullable<unknown>;
    name: NonNullable<unknown>;
};

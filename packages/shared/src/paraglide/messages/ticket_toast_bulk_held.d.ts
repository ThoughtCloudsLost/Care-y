/**
* | output |
* | --- |
* | "{count} tickets placed on hold" |
*
* @param {Ticket_Toast_Bulk_HeldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_bulk_held: ((inputs: Ticket_Toast_Bulk_HeldInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Toast_Bulk_HeldInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Toast_Bulk_HeldInputs = {
    count: NonNullable<unknown>;
};

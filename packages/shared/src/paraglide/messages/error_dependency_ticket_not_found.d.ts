/**
* | output |
* | --- |
* | "Dependency {ticket} not found." |
*
* @param {Error_Dependency_Ticket_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_dependency_ticket_not_found: ((inputs: Error_Dependency_Ticket_Not_FoundInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Dependency_Ticket_Not_FoundInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Dependency_Ticket_Not_FoundInputs = {
    ticket: NonNullable<unknown>;
    Ticket: NonNullable<unknown>;
};

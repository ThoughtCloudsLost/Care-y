/**
* | output |
* | --- |
* | "Assignments" |
*
* @param {Ticket_Filter_Type_AssignmentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_assignment: ((inputs?: Ticket_Filter_Type_AssignmentInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Filter_Type_AssignmentInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Filter_Type_AssignmentInputs = {};

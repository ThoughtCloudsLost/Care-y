/**
* | output |
* | --- |
* | "Only visible to {role} and above" |
*
* @param {Ticket_Note_Visible_To_RoleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_note_visible_to_role: ((inputs: Ticket_Note_Visible_To_RoleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Note_Visible_To_RoleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Note_Visible_To_RoleInputs = {
    role: NonNullable<unknown>;
};

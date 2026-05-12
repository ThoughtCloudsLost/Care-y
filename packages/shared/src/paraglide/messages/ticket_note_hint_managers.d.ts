/**
* | output |
* | --- |
* | "{managers}" |
*
* @param {Ticket_Note_Hint_ManagersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_note_hint_managers: ((inputs: Ticket_Note_Hint_ManagersInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Note_Hint_ManagersInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Note_Hint_ManagersInputs = {
    managers: NonNullable<unknown>;
};

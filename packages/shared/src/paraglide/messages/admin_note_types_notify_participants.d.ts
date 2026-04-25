/**
* | output |
* | --- |
* | "Ticket participants" |
*
* @param {Admin_Note_Types_Notify_ParticipantsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_notify_participants: ((inputs?: Admin_Note_Types_Notify_ParticipantsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Note_Types_Notify_ParticipantsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Note_Types_Notify_ParticipantsInputs = {};

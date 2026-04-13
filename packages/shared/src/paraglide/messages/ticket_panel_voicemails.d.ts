/**
* | output |
* | --- |
* | "Voicemails" |
*
* @param {Ticket_Panel_VoicemailsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_voicemails: ((inputs?: Ticket_Panel_VoicemailsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Panel_VoicemailsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Panel_VoicemailsInputs = {};

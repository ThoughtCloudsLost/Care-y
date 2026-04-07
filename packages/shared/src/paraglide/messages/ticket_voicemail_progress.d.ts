/**
* | output |
* | --- |
* | "{current} of {total}" |
*
* @param {Ticket_Voicemail_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_voicemail_progress: ((inputs: Ticket_Voicemail_ProgressInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Voicemail_ProgressInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Voicemail_ProgressInputs = {
    current: NonNullable<unknown>;
    total: NonNullable<unknown>;
};

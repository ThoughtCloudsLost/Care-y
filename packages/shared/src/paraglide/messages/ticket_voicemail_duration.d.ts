/**
* | output |
* | --- |
* | "{duration} seconds" |
*
* @param {Ticket_Voicemail_DurationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_voicemail_duration: ((inputs: Ticket_Voicemail_DurationInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Voicemail_DurationInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Voicemail_DurationInputs = {
    duration: NonNullable<unknown>;
};

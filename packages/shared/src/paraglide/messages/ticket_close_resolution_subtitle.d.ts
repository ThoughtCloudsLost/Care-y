/**
* | output |
* | --- |
* | "Add a note before closing (optional)" |
*
* @param {Ticket_Close_Resolution_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_close_resolution_subtitle: ((inputs?: Ticket_Close_Resolution_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Close_Resolution_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Close_Resolution_SubtitleInputs = {};

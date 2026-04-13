/**
* | output |
* | --- |
* | "{count} messages over {days} days, most recent {recency}" |
*
* @param {Ticket_Zoom_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_zoom_summary: ((inputs: Ticket_Zoom_SummaryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Zoom_SummaryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Zoom_SummaryInputs = {
    count: NonNullable<unknown>;
    days: NonNullable<unknown>;
    recency: NonNullable<unknown>;
};

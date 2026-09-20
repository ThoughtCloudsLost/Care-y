/**
* | output |
* | --- |
* | "{count} selected" |
*
* @param {Tickets_SelectedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_selected: ((inputs: Tickets_SelectedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_SelectedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_SelectedInputs = {
    count: NonNullable<unknown>;
};

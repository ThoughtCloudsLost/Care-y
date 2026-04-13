/**
* | output |
* | --- |
* | "{count} selected" |
*
* @param {Tickets_SelectedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_selected: ((inputs: Tickets_SelectedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_SelectedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_SelectedInputs = {
    count: NonNullable<unknown>;
};

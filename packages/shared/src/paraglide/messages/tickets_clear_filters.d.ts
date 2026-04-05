/**
* | output |
* | --- |
* | "Clear all" |
*
* @param {Tickets_Clear_FiltersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_clear_filters: ((inputs?: Tickets_Clear_FiltersInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Clear_FiltersInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Clear_FiltersInputs = {};

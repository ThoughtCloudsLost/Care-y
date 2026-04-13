/**
* | output |
* | --- |
* | "Clear dates" |
*
* @param {Tickets_Filter_Date_ClearInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_date_clear: ((inputs?: Tickets_Filter_Date_ClearInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Filter_Date_ClearInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Filter_Date_ClearInputs = {};

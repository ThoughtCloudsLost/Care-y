/**
* | output |
* | --- |
* | "Date created" |
*
* @param {Clients_Filter_Date_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_filter_date_created: ((inputs?: Clients_Filter_Date_CreatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Clients_Filter_Date_CreatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Clients_Filter_Date_CreatedInputs = {};

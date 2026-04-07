/**
* | output |
* | --- |
* | "Loading image..." |
*
* @param {Ticket_Mms_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_mms_loading: ((inputs?: Ticket_Mms_LoadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Mms_LoadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Mms_LoadingInputs = {};

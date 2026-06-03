/**
* | output |
* | --- |
* | "An individual case, call, or interaction tracked in the system." |
*
* @param {Admin_Terminology_Desc_TicketInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_desc_ticket: ((inputs?: Admin_Terminology_Desc_TicketInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_Desc_TicketInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_Desc_TicketInputs = {};

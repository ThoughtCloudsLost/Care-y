/**
* | output |
* | --- |
* | "Work on own cases" |
*
* @param {Permission_Manage_Own_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_own_tickets: ((inputs?: Permission_Manage_Own_TicketsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_Own_TicketsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_Own_TicketsInputs = {};

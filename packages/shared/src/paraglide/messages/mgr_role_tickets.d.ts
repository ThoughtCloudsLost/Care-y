/**
* | output |
* | --- |
* | "Elevated ticket management permissions" |
*
* @param {Mgr_Role_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const mgr_role_tickets: ((inputs?: Mgr_Role_TicketsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mgr_Role_TicketsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mgr_Role_TicketsInputs = {};

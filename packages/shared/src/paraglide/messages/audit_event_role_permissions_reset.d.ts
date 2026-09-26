/**
* | output |
* | --- |
* | "Role permissions reset to defaults" |
*
* @param {Audit_Event_Role_Permissions_ResetInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_role_permissions_reset: ((inputs?: Audit_Event_Role_Permissions_ResetInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Role_Permissions_ResetInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Role_Permissions_ResetInputs = {};

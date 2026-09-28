/**
* | output |
* | --- |
* | "Role permission changed" |
*
* @param {Audit_Event_Role_Permission_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_role_permission_changed: ((inputs?: Audit_Event_Role_Permission_ChangedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Role_Permission_ChangedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Role_Permission_ChangedInputs = {};

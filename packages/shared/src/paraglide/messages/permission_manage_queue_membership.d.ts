/**
* | output |
* | --- |
* | "Manage queue membership" |
*
* @param {Permission_Manage_Queue_MembershipInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_queue_membership: ((inputs?: Permission_Manage_Queue_MembershipInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_Queue_MembershipInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_Queue_MembershipInputs = {};

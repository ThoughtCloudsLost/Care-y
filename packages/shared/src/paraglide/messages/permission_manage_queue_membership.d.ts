/**
* | output |
* | --- |
* | "Add and remove queue members" |
*
* @param {Permission_Manage_Queue_MembershipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_queue_membership: ((inputs?: Permission_Manage_Queue_MembershipInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_Queue_MembershipInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_Queue_MembershipInputs = {};

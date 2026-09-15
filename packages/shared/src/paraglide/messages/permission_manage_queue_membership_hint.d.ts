/**
* | output |
* | --- |
* | "Adding someone to a queue grants them read access to every case in that queue. Removing them revokes that access." |
*
* @param {Permission_Manage_Queue_Membership_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_queue_membership_hint: ((inputs?: Permission_Manage_Queue_Membership_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_Queue_Membership_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_Queue_Membership_HintInputs = {};

/**
* | output |
* | --- |
* | "Set who is notified about a queue" |
*
* @param {Permission_Manage_Queue_NotificationsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_queue_notifications: ((inputs?: Permission_Manage_Queue_NotificationsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_Queue_NotificationsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_Queue_NotificationsInputs = {};

/**
* | output |
* | --- |
* | "Manage queue notifications" |
*
* @param {Permission_Manage_Queue_NotificationsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_queue_notifications: ((inputs?: Permission_Manage_Queue_NotificationsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_Queue_NotificationsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_Queue_NotificationsInputs = {};

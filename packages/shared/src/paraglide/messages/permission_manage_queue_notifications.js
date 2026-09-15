/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Queue_NotificationsInputs */

const en_permission_manage_queue_notifications = /** @type {(inputs: Permission_Manage_Queue_NotificationsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set who is notified about a queue`)
};

const es_permission_manage_queue_notifications = /** @type {(inputs: Permission_Manage_Queue_NotificationsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Definir quien recibe notificaciones de una cola`)
};

/**
* | output |
* | --- |
* | "Set who is notified about a queue" |
*
* @param {Permission_Manage_Queue_NotificationsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_queue_notifications = /** @type {((inputs?: Permission_Manage_Queue_NotificationsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Queue_NotificationsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_queue_notifications(inputs)
	return en_permission_manage_queue_notifications(inputs)
});
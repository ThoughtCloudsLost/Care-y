/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Queue_NotificationsInputs */

const en_permission_manage_queue_notifications = /** @type {(inputs: Permission_Manage_Queue_NotificationsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage queue notifications`)
};

const es_permission_manage_queue_notifications = /** @type {(inputs: Permission_Manage_Queue_NotificationsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestionar notificaciones de colas`)
};

/**
* | output |
* | --- |
* | "Manage queue notifications" |
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
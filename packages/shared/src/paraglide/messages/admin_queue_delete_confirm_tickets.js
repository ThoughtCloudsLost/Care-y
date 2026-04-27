/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_Delete_Confirm_TicketsInputs */

const en_admin_queue_delete_confirm_tickets = /** @type {(inputs: Admin_Queue_Delete_Confirm_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This queue has tickets. Choose a queue to move them to before deleting.`)
};

const es_admin_queue_delete_confirm_tickets = /** @type {(inputs: Admin_Queue_Delete_Confirm_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta cola tiene tickets. Elige una cola a la cual moverlos antes de eliminar.`)
};

/**
* | output |
* | --- |
* | "This queue has tickets. Choose a queue to move them to before deleting." |
*
* @param {Admin_Queue_Delete_Confirm_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_delete_confirm_tickets = /** @type {((inputs?: Admin_Queue_Delete_Confirm_TicketsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Delete_Confirm_TicketsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_delete_confirm_tickets(inputs)
	return es_admin_queue_delete_confirm_tickets(inputs)
});
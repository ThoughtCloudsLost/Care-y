/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown>, tickets: NonNullable<unknown> }} Admin_Queue_Delete_Confirm_TicketsInputs */

const en_admin_queue_delete_confirm_tickets = /** @type {(inputs: Admin_Queue_Delete_Confirm_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This ${i?.queue} has ${i?.tickets}. Choose a ${i?.queue} to move them to before deleting.`)
};

const es_admin_queue_delete_confirm_tickets = /** @type {(inputs: Admin_Queue_Delete_Confirm_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Esta ${i?.queue} tiene ${i?.tickets}. Elige una ${i?.queue} a la cual moverlos antes de eliminar.`)
};

const en_xa2_admin_queue_delete_confirm_tickets = /** @type {(inputs: Admin_Queue_Delete_Confirm_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thìs  ••${i?.queue} hàs  ••${i?.tickets}. Chòòsè à  ••••${i?.queue} tò mòvè thèm tò bèfòrè dèlètìng. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This {queue} has {tickets}. Choose a {queue} to move them to before deleting." |
*
* @param {Admin_Queue_Delete_Confirm_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_delete_confirm_tickets = /** @type {((inputs: Admin_Queue_Delete_Confirm_TicketsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Delete_Confirm_TicketsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_delete_confirm_tickets(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_delete_confirm_tickets(inputs)
	return en_admin_queue_delete_confirm_tickets(inputs)
});
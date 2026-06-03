/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown>, tickets: NonNullable<unknown> }} Admin_Queue_Delete_Confirm_EmptyInputs */

const en_admin_queue_delete_confirm_empty = /** @type {(inputs: Admin_Queue_Delete_Confirm_EmptyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This ${i?.queue} has no ${i?.tickets} and will be permanently deleted.`)
};

const es_admin_queue_delete_confirm_empty = /** @type {(inputs: Admin_Queue_Delete_Confirm_EmptyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Esta ${i?.queue} no tiene ${i?.tickets} y sera eliminada permanentemente.`)
};

/**
* | output |
* | --- |
* | "This {queue} has no {tickets} and will be permanently deleted." |
*
* @param {Admin_Queue_Delete_Confirm_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_delete_confirm_empty = /** @type {((inputs: Admin_Queue_Delete_Confirm_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Delete_Confirm_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_delete_confirm_empty(inputs)
	return es_admin_queue_delete_confirm_empty(inputs)
});
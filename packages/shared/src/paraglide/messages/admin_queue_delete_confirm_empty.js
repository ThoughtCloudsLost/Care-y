/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown>, tickets: NonNullable<unknown> }} Admin_Queue_Delete_Confirm_EmptyInputs */

const en_admin_queue_delete_confirm_empty = /** @type {(inputs: Admin_Queue_Delete_Confirm_EmptyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`This ${i?.queue} has no ${i?.tickets} and will be permanently deleted.`)
};

const es_admin_queue_delete_confirm_empty = /** @type {(inputs: Admin_Queue_Delete_Confirm_EmptyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Esta ${i?.queue} no tiene ${i?.tickets} y será eliminada permanentemente.`)
};

const en_xa2_admin_queue_delete_confirm_empty = /** @type {(inputs: Admin_Queue_Delete_Confirm_EmptyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Thìs  ••${i?.queue} hàs nò  •••${i?.tickets} ànd wìll bè pèrmànèntly dèlètèd. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This {queue} has no {tickets} and will be permanently deleted." |
*
* @param {Admin_Queue_Delete_Confirm_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_delete_confirm_empty = /** @type {((inputs: Admin_Queue_Delete_Confirm_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Delete_Confirm_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_delete_confirm_empty(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_delete_confirm_empty(inputs)
	return en_admin_queue_delete_confirm_empty(inputs)
});
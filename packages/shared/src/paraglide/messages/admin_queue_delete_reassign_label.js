/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown> }} Admin_Queue_Delete_Reassign_LabelInputs */

const en_admin_queue_delete_reassign_label = /** @type {(inputs: Admin_Queue_Delete_Reassign_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Move ${i?.tickets} to`)
};

const es_admin_queue_delete_reassign_label = /** @type {(inputs: Admin_Queue_Delete_Reassign_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Mover ${i?.tickets} a`)
};

const en_xa2_admin_queue_delete_reassign_label = /** @type {(inputs: Admin_Queue_Delete_Reassign_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Mòvè  ••${i?.tickets} tò •⟧`)
};

/**
* | output |
* | --- |
* | "Move {tickets} to" |
*
* @param {Admin_Queue_Delete_Reassign_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_delete_reassign_label = /** @type {((inputs: Admin_Queue_Delete_Reassign_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Delete_Reassign_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_delete_reassign_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_delete_reassign_label(inputs)
	return en_admin_queue_delete_reassign_label(inputs)
});
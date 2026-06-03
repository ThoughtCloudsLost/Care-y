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

/**
* | output |
* | --- |
* | "Move {tickets} to" |
*
* @param {Admin_Queue_Delete_Reassign_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_delete_reassign_label = /** @type {((inputs: Admin_Queue_Delete_Reassign_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_Delete_Reassign_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_delete_reassign_label(inputs)
	return es_admin_queue_delete_reassign_label(inputs)
});
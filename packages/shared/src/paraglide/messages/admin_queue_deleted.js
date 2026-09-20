/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown> }} Admin_Queue_DeletedInputs */

const en_admin_queue_deleted = /** @type {(inputs: Admin_Queue_DeletedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} deleted`)
};

const es_admin_queue_deleted = /** @type {(inputs: Admin_Queue_DeletedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} eliminada`)
};

const en_xa2_admin_queue_deleted = /** @type {(inputs: Admin_Queue_DeletedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue} dèlètèd •••⟧`)
};

/**
* | output |
* | --- |
* | "{Queue} deleted" |
*
* @param {Admin_Queue_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_deleted = /** @type {((inputs: Admin_Queue_DeletedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_DeletedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_deleted(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_deleted(inputs)
	return en_admin_queue_deleted(inputs)
});
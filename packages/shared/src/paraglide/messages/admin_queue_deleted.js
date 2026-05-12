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

/**
* | output |
* | --- |
* | "{Queue} deleted" |
*
* @param {Admin_Queue_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_deleted = /** @type {((inputs: Admin_Queue_DeletedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_DeletedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_deleted(inputs)
	return es_admin_queue_deleted(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown> }} Admin_Queue_UpdatedInputs */

const en_admin_queue_updated = /** @type {(inputs: Admin_Queue_UpdatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} updated`)
};

const es_admin_queue_updated = /** @type {(inputs: Admin_Queue_UpdatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} actualizada`)
};

/**
* | output |
* | --- |
* | "{Queue} updated" |
*
* @param {Admin_Queue_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_updated = /** @type {((inputs: Admin_Queue_UpdatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_UpdatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_updated(inputs)
	return es_admin_queue_updated(inputs)
});
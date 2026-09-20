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

const en_xa2_admin_queue_updated = /** @type {(inputs: Admin_Queue_UpdatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue} ùpdàtèd •••⟧`)
};

/**
* | output |
* | --- |
* | "{Queue} updated" |
*
* @param {Admin_Queue_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_updated = /** @type {((inputs: Admin_Queue_UpdatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_UpdatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_updated(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_updated(inputs)
	return en_admin_queue_updated(inputs)
});
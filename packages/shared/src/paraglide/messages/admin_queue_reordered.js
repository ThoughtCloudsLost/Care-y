/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown>, queues: NonNullable<unknown> }} Admin_Queue_ReorderedInputs */

const en_admin_queue_reordered = /** @type {(inputs: Admin_Queue_ReorderedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} order updated`)
};

const es_admin_queue_reordered = /** @type {(inputs: Admin_Queue_ReorderedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Orden de ${i?.queues} actualizado`)
};

const en_xa2_admin_queue_reordered = /** @type {(inputs: Admin_Queue_ReorderedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue} òrdèr ùpdàtèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "{Queue} order updated" |
*
* @param {Admin_Queue_ReorderedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_reordered = /** @type {((inputs: Admin_Queue_ReorderedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_ReorderedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_reordered(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_reordered(inputs)
	return en_admin_queue_reordered(inputs)
});
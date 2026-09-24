/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown> }} Admin_Queue_CreatedInputs */

const en_admin_queue_created = /** @type {(inputs: Admin_Queue_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} created`)
};

const es_admin_queue_created = /** @type {(inputs: Admin_Queue_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} creada`)
};

const en_xa2_admin_queue_created = /** @type {(inputs: Admin_Queue_CreatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue} crèàtèd •••⟧`)
};

/**
* | output |
* | --- |
* | "{Queue} created" |
*
* @param {Admin_Queue_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_created = /** @type {((inputs: Admin_Queue_CreatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_CreatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_created(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_created(inputs)
	return en_admin_queue_created(inputs)
});
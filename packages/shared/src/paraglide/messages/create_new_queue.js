/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown> }} Create_New_QueueInputs */

const en_create_new_queue = /** @type {(inputs: Create_New_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`New ${i?.Queue}`)
};

const es_create_new_queue = /** @type {(inputs: Create_New_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Nueva ${i?.Queue}`)
};

const en_xa2_create_new_queue = /** @type {(inputs: Create_New_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Nèw  ••${i?.Queue}⟧`)
};

/**
* | output |
* | --- |
* | "New {Queue}" |
*
* @param {Create_New_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const create_new_queue = /** @type {((inputs: Create_New_QueueInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Create_New_QueueInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_create_new_queue(inputs)
	if (locale === "en-XA") return en_xa2_create_new_queue(inputs)
	return en_create_new_queue(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown> }} Error_Queue_Not_FoundInputs */

const en_error_queue_not_found = /** @type {(inputs: Error_Queue_Not_FoundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} not found.`)
};

const es_error_queue_not_found = /** @type {(inputs: Error_Queue_Not_FoundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} no encontrada.`)
};

const en_xa2_error_queue_not_found = /** @type {(inputs: Error_Queue_Not_FoundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue} nòt fòùnd. ••••⟧`)
};

/**
* | output |
* | --- |
* | "{Queue} not found." |
*
* @param {Error_Queue_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_queue_not_found = /** @type {((inputs: Error_Queue_Not_FoundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Queue_Not_FoundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_queue_not_found(inputs)
	if (locale === "en-XA") return en_xa2_error_queue_not_found(inputs)
	return en_error_queue_not_found(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Queues_EmptyInputs */

const en_vol_queues_empty = /** @type {(inputs: Vol_Queues_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You are not assigned to any queues yet.`)
};

const es_vol_queues_empty = /** @type {(inputs: Vol_Queues_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No tienes colas asignadas todavia.`)
};

/**
* | output |
* | --- |
* | "You are not assigned to any queues yet." |
*
* @param {Vol_Queues_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_queues_empty = /** @type {((inputs?: Vol_Queues_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Queues_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_vol_queues_empty(inputs)
	return es_vol_queues_empty(inputs)
});
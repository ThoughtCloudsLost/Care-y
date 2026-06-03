/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queues: NonNullable<unknown> }} Getting_Started_QueuesInputs */

const en_getting_started_queues = /** @type {(inputs: Getting_Started_QueuesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Set up additional ${i?.queues}`)
};

const es_getting_started_queues = /** @type {(inputs: Getting_Started_QueuesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Configurar ${i?.queues} adicionales`)
};

/**
* | output |
* | --- |
* | "Set up additional {queues}" |
*
* @param {Getting_Started_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_queues = /** @type {((inputs: Getting_Started_QueuesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_QueuesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_queues(inputs)
	return es_getting_started_queues(inputs)
});
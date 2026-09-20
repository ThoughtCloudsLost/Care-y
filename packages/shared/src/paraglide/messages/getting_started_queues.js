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

const en_xa2_getting_started_queues = /** @type {(inputs: Getting_Started_QueuesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Sèt ùp àddìtìònàl  ••••••${i?.queues}⟧`)
};

/**
* | output |
* | --- |
* | "Set up additional {queues}" |
*
* @param {Getting_Started_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_queues = /** @type {((inputs: Getting_Started_QueuesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_QueuesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_getting_started_queues(inputs)
	if (locale === "en-XA") return en_xa2_getting_started_queues(inputs)
	return en_getting_started_queues(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queues: NonNullable<unknown> }} Getting_Started_Queues_DescInputs */

const en_getting_started_queues_desc = /** @type {(inputs: Getting_Started_Queues_DescInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Route calls to specialized teams with separate ${i?.queues}.`)
};

const es_getting_started_queues_desc = /** @type {(inputs: Getting_Started_Queues_DescInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Dirige llamadas a equipos especializados con ${i?.queues} separadas.`)
};

/**
* | output |
* | --- |
* | "Route calls to specialized teams with separate {queues}." |
*
* @param {Getting_Started_Queues_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_queues_desc = /** @type {((inputs: Getting_Started_Queues_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_Queues_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_queues_desc(inputs)
	return es_getting_started_queues_desc(inputs)
});
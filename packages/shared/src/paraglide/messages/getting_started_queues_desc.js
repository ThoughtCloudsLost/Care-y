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

const en_xa2_getting_started_queues_desc = /** @type {(inputs: Getting_Started_Queues_DescInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Ròùtè càlls tò spècìàlìzèd tèàms wìth sèpàràtè  •••••••••••••••${i?.queues}. •⟧`)
};

/**
* | output |
* | --- |
* | "Route calls to specialized teams with separate {queues}." |
*
* @param {Getting_Started_Queues_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_queues_desc = /** @type {((inputs: Getting_Started_Queues_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_Queues_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_getting_started_queues_desc(inputs)
	if (locale === "en-XA") return en_xa2_getting_started_queues_desc(inputs)
	return en_getting_started_queues_desc(inputs)
});
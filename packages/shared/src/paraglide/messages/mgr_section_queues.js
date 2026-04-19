/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mgr_Section_QueuesInputs */

const en_mgr_section_queues = /** @type {(inputs: Mgr_Section_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your Queues`)
};

const es_mgr_section_queues = /** @type {(inputs: Mgr_Section_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tus Colas`)
};

/**
* | output |
* | --- |
* | "Your Queues" |
*
* @param {Mgr_Section_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_section_queues = /** @type {((inputs?: Mgr_Section_QueuesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Section_QueuesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mgr_section_queues(inputs)
	return es_mgr_section_queues(inputs)
});
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

const en_xa2_mgr_section_queues = /** @type {(inputs: Mgr_Section_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr Qùèùès ••••⟧`)
};

/**
* | output |
* | --- |
* | "Your Queues" |
*
* @param {Mgr_Section_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const mgr_section_queues = /** @type {((inputs?: Mgr_Section_QueuesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Section_QueuesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_mgr_section_queues(inputs)
	if (locale === "en-XA") return en_xa2_mgr_section_queues(inputs)
	return en_mgr_section_queues(inputs)
});
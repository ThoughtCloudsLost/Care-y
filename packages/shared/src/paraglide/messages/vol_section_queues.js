/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Section_QueuesInputs */

const en_vol_section_queues = /** @type {(inputs: Vol_Section_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your Queues`)
};

const es_vol_section_queues = /** @type {(inputs: Vol_Section_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tus Colas`)
};

const en_xa2_vol_section_queues = /** @type {(inputs: Vol_Section_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr Qùèùès ••••⟧`)
};

/**
* | output |
* | --- |
* | "Your Queues" |
*
* @param {Vol_Section_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const vol_section_queues = /** @type {((inputs?: Vol_Section_QueuesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Section_QueuesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_vol_section_queues(inputs)
	if (locale === "en-XA") return en_xa2_vol_section_queues(inputs)
	return en_vol_section_queues(inputs)
});
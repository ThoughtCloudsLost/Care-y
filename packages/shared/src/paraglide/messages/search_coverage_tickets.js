/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ searched: NonNullable<unknown>, total: NonNullable<unknown>, tickets: NonNullable<unknown> }} Search_Coverage_TicketsInputs */

const en_search_coverage_tickets = /** @type {(inputs: Search_Coverage_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Searched ${i?.searched} of ${i?.total} ${i?.tickets} already unlocked on this device.`)
};

const es_search_coverage_tickets = /** @type {(inputs: Search_Coverage_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Se buscó en ${i?.searched} de ${i?.total} ${i?.tickets} ya desbloqueados en este dispositivo.`)
};

/**
* | output |
* | --- |
* | "Searched {searched} of {total} {tickets} already unlocked on this device." |
*
* @param {Search_Coverage_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_coverage_tickets = /** @type {((inputs: Search_Coverage_TicketsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Coverage_TicketsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_coverage_tickets(inputs)
	return es_search_coverage_tickets(inputs)
});
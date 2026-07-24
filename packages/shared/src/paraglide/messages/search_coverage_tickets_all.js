/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ total: NonNullable<unknown>, tickets: NonNullable<unknown> }} Search_Coverage_Tickets_AllInputs */

const en_search_coverage_tickets_all = /** @type {(inputs: Search_Coverage_Tickets_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Searched all ${i?.total} ${i?.tickets} unlocked on this device.`)
};

const es_search_coverage_tickets_all = /** @type {(inputs: Search_Coverage_Tickets_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Se buscó en todos los ${i?.total} ${i?.tickets} desbloqueados en este dispositivo.`)
};

/**
* | output |
* | --- |
* | "Searched all {total} {tickets} unlocked on this device." |
*
* @param {Search_Coverage_Tickets_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_coverage_tickets_all = /** @type {((inputs: Search_Coverage_Tickets_AllInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Coverage_Tickets_AllInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_coverage_tickets_all(inputs)
	return es_search_coverage_tickets_all(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Clients_Search_PlaceholderInputs */

const en_clients_search_placeholder = /** @type {(inputs: Clients_Search_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search by alias...`)
};

const es_clients_search_placeholder = /** @type {(inputs: Clients_Search_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar por alias...`)
};

/**
* | output |
* | --- |
* | "Search by alias..." |
*
* @param {Clients_Search_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_search_placeholder = /** @type {((inputs?: Clients_Search_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Search_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_clients_search_placeholder(inputs)
	return es_clients_search_placeholder(inputs)
});
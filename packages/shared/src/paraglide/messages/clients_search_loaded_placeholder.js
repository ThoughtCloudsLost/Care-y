/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Clients_Search_Loaded_PlaceholderInputs */

const en_clients_search_loaded_placeholder = /** @type {(inputs: Clients_Search_Loaded_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filter loaded rows...`)
};

const es_clients_search_loaded_placeholder = /** @type {(inputs: Clients_Search_Loaded_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtrar filas cargadas...`)
};

/**
* | output |
* | --- |
* | "Filter loaded rows..." |
*
* @param {Clients_Search_Loaded_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_search_loaded_placeholder = /** @type {((inputs?: Clients_Search_Loaded_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Search_Loaded_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_clients_search_loaded_placeholder(inputs)
	return es_clients_search_loaded_placeholder(inputs)
});
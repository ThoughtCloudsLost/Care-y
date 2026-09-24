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

const en_xa2_clients_search_loaded_placeholder = /** @type {(inputs: Clients_Search_Loaded_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìltèr lòàdèd ròws... •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Filter loaded rows..." |
*
* @param {Clients_Search_Loaded_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const clients_search_loaded_placeholder = /** @type {((inputs?: Clients_Search_Loaded_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Search_Loaded_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_clients_search_loaded_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_clients_search_loaded_placeholder(inputs)
	return en_clients_search_loaded_placeholder(inputs)
});
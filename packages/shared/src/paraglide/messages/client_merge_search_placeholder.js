/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Client_Merge_Search_PlaceholderInputs */

const en_client_merge_search_placeholder = /** @type {(inputs: Client_Merge_Search_PlaceholderInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Search for a ${i?.client} to merge...`)
};

const es_client_merge_search_placeholder = /** @type {(inputs: Client_Merge_Search_PlaceholderInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Buscar un ${i?.client} para fusionar...`)
};

/**
* | output |
* | --- |
* | "Search for a {client} to merge..." |
*
* @param {Client_Merge_Search_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_search_placeholder = /** @type {((inputs: Client_Merge_Search_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_Search_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_merge_search_placeholder(inputs)
	return es_client_merge_search_placeholder(inputs)
});
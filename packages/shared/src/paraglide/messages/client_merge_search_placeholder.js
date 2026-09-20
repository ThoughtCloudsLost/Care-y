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

const en_xa2_client_merge_search_placeholder = /** @type {(inputs: Client_Merge_Search_PlaceholderInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Sèàrch fòr à  ••••${i?.client} tò mèrgè... ••••⟧`)
};

/**
* | output |
* | --- |
* | "Search for a {client} to merge..." |
*
* @param {Client_Merge_Search_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_merge_search_placeholder = /** @type {((inputs: Client_Merge_Search_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_Search_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_merge_search_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_client_merge_search_placeholder(inputs)
	return en_client_merge_search_placeholder(inputs)
});
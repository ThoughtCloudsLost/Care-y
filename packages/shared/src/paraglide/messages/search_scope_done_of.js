/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ searched: NonNullable<unknown>, total: NonNullable<unknown> }} Search_Scope_Done_OfInputs */

const en_search_scope_done_of = /** @type {(inputs: Search_Scope_Done_OfInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Searched ${i?.searched} of ${i?.total} loaded and decrypted`)
};

const es_search_scope_done_of = /** @type {(inputs: Search_Scope_Done_OfInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Se buscaron ${i?.searched} de ${i?.total} cargados y descifrados`)
};

/**
* | output |
* | --- |
* | "Searched {searched} of {total} loaded and decrypted" |
*
* @param {Search_Scope_Done_OfInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_scope_done_of = /** @type {((inputs: Search_Scope_Done_OfInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Scope_Done_OfInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_scope_done_of(inputs)
	return es_search_scope_done_of(inputs)
});
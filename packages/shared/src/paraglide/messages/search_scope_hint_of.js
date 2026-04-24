/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ searched: NonNullable<unknown>, total: NonNullable<unknown> }} Search_Scope_Hint_OfInputs */

const en_search_scope_hint_of = /** @type {(inputs: Search_Scope_Hint_OfInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Searching ${i?.searched} of ${i?.total} items`)
};

const es_search_scope_hint_of = /** @type {(inputs: Search_Scope_Hint_OfInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Buscando en ${i?.searched} de ${i?.total} elementos`)
};

/**
* | output |
* | --- |
* | "Searching {searched} of {total} items" |
*
* @param {Search_Scope_Hint_OfInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_scope_hint_of = /** @type {((inputs: Search_Scope_Hint_OfInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Scope_Hint_OfInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_scope_hint_of(inputs)
	return es_search_scope_hint_of(inputs)
});
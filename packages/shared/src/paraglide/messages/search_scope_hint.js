/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Search_Scope_HintInputs */

const en_search_scope_hint = /** @type {(inputs: Search_Scope_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Searching ${i?.count} loaded and decrypted`)
};

const es_search_scope_hint = /** @type {(inputs: Search_Scope_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Buscando en ${i?.count} cargados y descifrados`)
};

/**
* | output |
* | --- |
* | "Searching {count} loaded and decrypted" |
*
* @param {Search_Scope_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_scope_hint = /** @type {((inputs: Search_Scope_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Scope_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_scope_hint(inputs)
	return es_search_scope_hint(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Search_Scope_DoneInputs */

const en_search_scope_done = /** @type {(inputs: Search_Scope_DoneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Searched ${i?.count} loaded and decrypted`)
};

const es_search_scope_done = /** @type {(inputs: Search_Scope_DoneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Se buscaron ${i?.count} cargados y descifrados`)
};

/**
* | output |
* | --- |
* | "Searched {count} loaded and decrypted" |
*
* @param {Search_Scope_DoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_scope_done = /** @type {((inputs: Search_Scope_DoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Scope_DoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_search_scope_done(inputs)
	return es_search_scope_done(inputs)
});
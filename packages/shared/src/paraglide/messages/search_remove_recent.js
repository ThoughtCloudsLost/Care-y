/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Remove_RecentInputs */

const en_search_remove_recent = /** @type {(inputs: Search_Remove_RecentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove`)
};

const es_search_remove_recent = /** @type {(inputs: Search_Remove_RecentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar`)
};

const en_xa2_search_remove_recent = /** @type {(inputs: Search_Remove_RecentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvè ••⟧`)
};

/**
* | output |
* | --- |
* | "Remove" |
*
* @param {Search_Remove_RecentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_remove_recent = /** @type {((inputs?: Search_Remove_RecentInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Remove_RecentInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_remove_recent(inputs)
	if (locale === "en-XA") return en_xa2_search_remove_recent(inputs)
	return en_search_remove_recent(inputs)
});
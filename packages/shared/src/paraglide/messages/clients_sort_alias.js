/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Clients_Sort_AliasInputs */

const en_clients_sort_alias = /** @type {(inputs: Clients_Sort_AliasInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alias`)
};

const es_clients_sort_alias = /** @type {(inputs: Clients_Sort_AliasInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alias`)
};

/**
* | output |
* | --- |
* | "Alias" |
*
* @param {Clients_Sort_AliasInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_sort_alias = /** @type {((inputs?: Clients_Sort_AliasInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Sort_AliasInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_clients_sort_alias(inputs)
	return es_clients_sort_alias(inputs)
});
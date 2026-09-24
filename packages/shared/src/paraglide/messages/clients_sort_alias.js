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

const en_xa2_clients_sort_alias = /** @type {(inputs: Clients_Sort_AliasInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àlìàs ••⟧`)
};

/**
* | output |
* | --- |
* | "Alias" |
*
* @param {Clients_Sort_AliasInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const clients_sort_alias = /** @type {((inputs?: Clients_Sort_AliasInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Sort_AliasInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_clients_sort_alias(inputs)
	if (locale === "en-XA") return en_xa2_clients_sort_alias(inputs)
	return en_clients_sort_alias(inputs)
});
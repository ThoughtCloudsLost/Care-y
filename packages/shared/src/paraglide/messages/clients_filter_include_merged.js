/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Clients_Filter_Include_MergedInputs */

const en_clients_filter_include_merged = /** @type {(inputs: Clients_Filter_Include_MergedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Include merged`)
};

const es_clients_filter_include_merged = /** @type {(inputs: Clients_Filter_Include_MergedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Incluir fusionados`)
};

/**
* | output |
* | --- |
* | "Include merged" |
*
* @param {Clients_Filter_Include_MergedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_filter_include_merged = /** @type {((inputs?: Clients_Filter_Include_MergedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Filter_Include_MergedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_clients_filter_include_merged(inputs)
	return es_clients_filter_include_merged(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Clients_Filter_Include_Merged_YesInputs */

const en_clients_filter_include_merged_yes = /** @type {(inputs: Clients_Filter_Include_Merged_YesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Show merged`)
};

const es_clients_filter_include_merged_yes = /** @type {(inputs: Clients_Filter_Include_Merged_YesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mostrar fusionados`)
};

/**
* | output |
* | --- |
* | "Show merged" |
*
* @param {Clients_Filter_Include_Merged_YesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_filter_include_merged_yes = /** @type {((inputs?: Clients_Filter_Include_Merged_YesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Filter_Include_Merged_YesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_clients_filter_include_merged_yes(inputs)
	return es_clients_filter_include_merged_yes(inputs)
});
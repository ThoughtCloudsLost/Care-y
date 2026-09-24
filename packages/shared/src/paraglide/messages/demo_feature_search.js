/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Feature_SearchInputs */

const en_demo_feature_search = /** @type {(inputs: Demo_Feature_SearchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search`)
};

const es_demo_feature_search = /** @type {(inputs: Demo_Feature_SearchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Buscar`)
};

const en_xa2_demo_feature_search = /** @type {(inputs: Demo_Feature_SearchInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèàrch ••⟧`)
};

/**
* | output |
* | --- |
* | "Search" |
*
* @param {Demo_Feature_SearchInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_feature_search = /** @type {((inputs?: Demo_Feature_SearchInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Feature_SearchInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_feature_search(inputs)
	if (locale === "en-XA") return en_xa2_demo_feature_search(inputs)
	return en_demo_feature_search(inputs)
});
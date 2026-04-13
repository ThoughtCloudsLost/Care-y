/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Feature_Coming_SoonInputs */

const en_feature_coming_soon = /** @type {(inputs: Feature_Coming_SoonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Feature coming soon`)
};

const es_feature_coming_soon = /** @type {(inputs: Feature_Coming_SoonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Funcion disponible pronto`)
};

/**
* | output |
* | --- |
* | "Feature coming soon" |
*
* @param {Feature_Coming_SoonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const feature_coming_soon = /** @type {((inputs?: Feature_Coming_SoonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Feature_Coming_SoonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_feature_coming_soon(inputs)
	return es_feature_coming_soon(inputs)
});
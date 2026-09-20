/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Feature_Coming_SoonInputs */

const en_feature_coming_soon = /** @type {(inputs: Feature_Coming_SoonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Feature coming soon`)
};

const es_feature_coming_soon = /** @type {(inputs: Feature_Coming_SoonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Función disponible pronto`)
};

const en_xa2_feature_coming_soon = /** @type {(inputs: Feature_Coming_SoonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fèàtùrè còmìng sòòn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Feature coming soon" |
*
* @param {Feature_Coming_SoonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const feature_coming_soon = /** @type {((inputs?: Feature_Coming_SoonInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Feature_Coming_SoonInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_feature_coming_soon(inputs)
	if (locale === "en-XA") return en_xa2_feature_coming_soon(inputs)
	return en_feature_coming_soon(inputs)
});
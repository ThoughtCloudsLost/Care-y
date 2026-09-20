/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_RetentionInputs */

const en_getting_started_retention = /** @type {(inputs: Getting_Started_RetentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configure data retention`)
};

const es_getting_started_retention = /** @type {(inputs: Getting_Started_RetentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurar retención de datos`)
};

const en_xa2_getting_started_retention = /** @type {(inputs: Getting_Started_RetentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònfìgùrè dàtà rètèntìòn ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Configure data retention" |
*
* @param {Getting_Started_RetentionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_retention = /** @type {((inputs?: Getting_Started_RetentionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_RetentionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_getting_started_retention(inputs)
	if (locale === "en-XA") return en_xa2_getting_started_retention(inputs)
	return en_getting_started_retention(inputs)
});
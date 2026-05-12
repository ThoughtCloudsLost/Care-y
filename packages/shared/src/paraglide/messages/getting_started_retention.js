/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_RetentionInputs */

const en_getting_started_retention = /** @type {(inputs: Getting_Started_RetentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configure data retention`)
};

const es_getting_started_retention = /** @type {(inputs: Getting_Started_RetentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurar retencion de datos`)
};

/**
* | output |
* | --- |
* | "Configure data retention" |
*
* @param {Getting_Started_RetentionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_retention = /** @type {((inputs?: Getting_Started_RetentionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_RetentionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_retention(inputs)
	return es_getting_started_retention(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Empty_No_ResultsInputs */

const en_empty_no_results = /** @type {(inputs: Empty_No_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No results found.`)
};

const es_empty_no_results = /** @type {(inputs: Empty_No_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se encontraron resultados.`)
};

/**
* | output |
* | --- |
* | "No results found." |
*
* @param {Empty_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const empty_no_results = /** @type {((inputs?: Empty_No_ResultsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Empty_No_ResultsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_empty_no_results(inputs)
	return es_empty_no_results(inputs)
});
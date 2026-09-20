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

const en_xa2_empty_no_results = /** @type {(inputs: Empty_No_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò rèsùlts fòùnd. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "No results found." |
*
* @param {Empty_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const empty_no_results = /** @type {((inputs?: Empty_No_ResultsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Empty_No_ResultsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_empty_no_results(inputs)
	if (locale === "en-XA") return en_xa2_empty_no_results(inputs)
	return en_empty_no_results(inputs)
});
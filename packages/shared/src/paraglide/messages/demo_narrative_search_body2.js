/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Search_Body2Inputs */

const en_demo_narrative_search_body2 = /** @type {(inputs: Demo_Narrative_Search_Body2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This means search results are as private as the tickets themselves. The server cannot log what you searched for or which results matched.`)
};

const es_demo_narrative_search_body2 = /** @type {(inputs: Demo_Narrative_Search_Body2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los resultados de busqueda son tan privados como los tickets mismos. El servidor no puede registrar lo que buscaste ni que resultados coincidieron.`)
};

/**
* | output |
* | --- |
* | "This means search results are as private as the tickets themselves. The server cannot log what you searched for or which results matched." |
*
* @param {Demo_Narrative_Search_Body2Inputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_body2 = /** @type {((inputs?: Demo_Narrative_Search_Body2Inputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Search_Body2Inputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_search_body2(inputs)
	return es_demo_narrative_search_body2(inputs)
});
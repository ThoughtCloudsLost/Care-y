/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_Kb_DescInputs */

const en_getting_started_kb_desc = /** @type {(inputs: Getting_Started_Kb_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Give volunteers quick-reference guides and protocols.`)
};

const es_getting_started_kb_desc = /** @type {(inputs: Getting_Started_Kb_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Proporciona guias de referencia rapida y protocolos a los voluntarios.`)
};

/**
* | output |
* | --- |
* | "Give volunteers quick-reference guides and protocols." |
*
* @param {Getting_Started_Kb_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_kb_desc = /** @type {((inputs?: Getting_Started_Kb_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_Kb_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_kb_desc(inputs)
	return es_getting_started_kb_desc(inputs)
});
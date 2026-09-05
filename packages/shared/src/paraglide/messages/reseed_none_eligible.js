/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reseed_None_EligibleInputs */

const en_reseed_none_eligible = /** @type {(inputs: Reseed_None_EligibleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No messages were eligible to recover.`)
};

const es_reseed_none_eligible = /** @type {(inputs: Reseed_None_EligibleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ningún mensaje era elegible para recuperar.`)
};

/**
* | output |
* | --- |
* | "No messages were eligible to recover." |
*
* @param {Reseed_None_EligibleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reseed_none_eligible = /** @type {((inputs?: Reseed_None_EligibleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reseed_None_EligibleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_reseed_none_eligible(inputs)
	return es_reseed_none_eligible(inputs)
});
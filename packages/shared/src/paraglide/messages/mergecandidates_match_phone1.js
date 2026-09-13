/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mergecandidates_Match_Phone1Inputs */

const en_mergecandidates_match_phone1 = /** @type {(inputs: Mergecandidates_Match_Phone1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Same phone number`)
};

const es_mergecandidates_match_phone1 = /** @type {(inputs: Mergecandidates_Match_Phone1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mismo número de teléfono`)
};

/**
* | output |
* | --- |
* | "Same phone number" |
*
* @param {Mergecandidates_Match_Phone1Inputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
const mergecandidates_match_phone1 = /** @type {((inputs?: Mergecandidates_Match_Phone1Inputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mergecandidates_Match_Phone1Inputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mergecandidates_match_phone1(inputs)
	return es_mergecandidates_match_phone1(inputs)
});
export { mergecandidates_match_phone1 as "mergeCandidates_match_phone" }
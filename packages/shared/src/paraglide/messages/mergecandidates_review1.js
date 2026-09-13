/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mergecandidates_Review1Inputs */

const en_mergecandidates_review1 = /** @type {(inputs: Mergecandidates_Review1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Review`)
};

const es_mergecandidates_review1 = /** @type {(inputs: Mergecandidates_Review1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revisar`)
};

/**
* | output |
* | --- |
* | "Review" |
*
* @param {Mergecandidates_Review1Inputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
const mergecandidates_review1 = /** @type {((inputs?: Mergecandidates_Review1Inputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mergecandidates_Review1Inputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mergecandidates_review1(inputs)
	return es_mergecandidates_review1(inputs)
});
export { mergecandidates_review1 as "mergeCandidates_review" }
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Your_Vote_UpInputs */

const en_library_your_vote_up = /** @type {(inputs: Library_Your_Vote_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You found this helpful`)
};

const es_library_your_vote_up = /** @type {(inputs: Library_Your_Vote_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lo encontraste útil`)
};

/**
* | output |
* | --- |
* | "You found this helpful" |
*
* @param {Library_Your_Vote_UpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_your_vote_up = /** @type {((inputs?: Library_Your_Vote_UpInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Your_Vote_UpInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_your_vote_up(inputs)
	return es_library_your_vote_up(inputs)
});
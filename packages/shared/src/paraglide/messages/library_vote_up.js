/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Vote_UpInputs */

const en_library_vote_up = /** @type {(inputs: Library_Vote_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Helpful`)
};

const es_library_vote_up = /** @type {(inputs: Library_Vote_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Útil`)
};

const en_xa2_library_vote_up = /** @type {(inputs: Library_Vote_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hèlpfùl •••⟧`)
};

/**
* | output |
* | --- |
* | "Helpful" |
*
* @param {Library_Vote_UpInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_vote_up = /** @type {((inputs?: Library_Vote_UpInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Vote_UpInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_vote_up(inputs)
	if (locale === "en-XA") return en_xa2_library_vote_up(inputs)
	return en_library_vote_up(inputs)
});
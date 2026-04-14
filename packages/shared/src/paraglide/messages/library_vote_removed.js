/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Vote_RemovedInputs */

const en_library_vote_removed = /** @type {(inputs: Library_Vote_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vote removed`)
};

const es_library_vote_removed = /** @type {(inputs: Library_Vote_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voto eliminado`)
};

/**
* | output |
* | --- |
* | "Vote removed" |
*
* @param {Library_Vote_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_vote_removed = /** @type {((inputs?: Library_Vote_RemovedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Vote_RemovedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_vote_removed(inputs)
	return es_library_vote_removed(inputs)
});
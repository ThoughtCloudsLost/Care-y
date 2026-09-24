/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ up: NonNullable<unknown>, total: NonNullable<unknown> }} Library_Vote_CountInputs */

const en_library_vote_count = /** @type {(inputs: Library_Vote_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.up} of ${i?.total} found helpful`)
};

const es_library_vote_count = /** @type {(inputs: Library_Vote_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.up} de ${i?.total} lo encontraron útil`)
};

const en_xa2_library_vote_count = /** @type {(inputs: Library_Vote_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.up} òf  ••${i?.total} fòùnd hèlpfùl •••••⟧`)
};

/**
* | output |
* | --- |
* | "{up} of {total} found helpful" |
*
* @param {Library_Vote_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_vote_count = /** @type {((inputs: Library_Vote_CountInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Vote_CountInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_vote_count(inputs)
	if (locale === "en-XA") return en_xa2_library_vote_count(inputs)
	return en_library_vote_count(inputs)
});
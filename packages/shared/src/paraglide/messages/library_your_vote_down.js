/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Your_Vote_DownInputs */

const en_library_your_vote_down = /** @type {(inputs: Library_Your_Vote_DownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You marked this as not helpful`)
};

const es_library_your_vote_down = /** @type {(inputs: Library_Your_Vote_DownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lo marcaste como no útil`)
};

const en_xa2_library_your_vote_down = /** @type {(inputs: Library_Your_Vote_DownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòù màrkèd thìs às nòt hèlpfùl •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "You marked this as not helpful" |
*
* @param {Library_Your_Vote_DownInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_your_vote_down = /** @type {((inputs?: Library_Your_Vote_DownInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Your_Vote_DownInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_your_vote_down(inputs)
	if (locale === "en-XA") return en_xa2_library_your_vote_down(inputs)
	return en_library_your_vote_down(inputs)
});
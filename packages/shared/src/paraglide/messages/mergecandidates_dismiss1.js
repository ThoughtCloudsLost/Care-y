/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mergecandidates_Dismiss1Inputs */

const en_mergecandidates_dismiss1 = /** @type {(inputs: Mergecandidates_Dismiss1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dismiss`)
};

const es_mergecandidates_dismiss1 = /** @type {(inputs: Mergecandidates_Dismiss1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descartar`)
};

const en_xa2_mergecandidates_dismiss1 = /** @type {(inputs: Mergecandidates_Dismiss1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsmìss •••⟧`)
};

/**
* | output |
* | --- |
* | "Dismiss" |
*
* @param {Mergecandidates_Dismiss1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
const mergecandidates_dismiss1 = /** @type {((inputs?: Mergecandidates_Dismiss1Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mergecandidates_Dismiss1Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_mergecandidates_dismiss1(inputs)
	if (locale === "en-XA") return en_xa2_mergecandidates_dismiss1(inputs)
	return en_mergecandidates_dismiss1(inputs)
});
export { mergecandidates_dismiss1 as "mergeCandidates_dismiss" }
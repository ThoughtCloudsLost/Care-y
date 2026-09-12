/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mergecandidates_Shared_Line1Inputs */

const en_mergecandidates_shared_line1 = /** @type {(inputs: Mergecandidates_Shared_Line1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shared line`)
};

const es_mergecandidates_shared_line1 = /** @type {(inputs: Mergecandidates_Shared_Line1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Línea compartida`)
};

/**
* | output |
* | --- |
* | "Shared line" |
*
* @param {Mergecandidates_Shared_Line1Inputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
const mergecandidates_shared_line1 = /** @type {((inputs?: Mergecandidates_Shared_Line1Inputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mergecandidates_Shared_Line1Inputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mergecandidates_shared_line1(inputs)
	return es_mergecandidates_shared_line1(inputs)
});
export { mergecandidates_shared_line1 as "mergeCandidates_shared_line" }
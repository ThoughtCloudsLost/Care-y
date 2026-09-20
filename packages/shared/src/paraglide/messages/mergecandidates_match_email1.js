/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mergecandidates_Match_Email1Inputs */

const en_mergecandidates_match_email1 = /** @type {(inputs: Mergecandidates_Match_Email1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Same email address`)
};

const es_mergecandidates_match_email1 = /** @type {(inputs: Mergecandidates_Match_Email1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Misma dirección de correo`)
};

const en_xa2_mergecandidates_match_email1 = /** @type {(inputs: Mergecandidates_Match_Email1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàmè èmàìl àddrèss ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Same email address" |
*
* @param {Mergecandidates_Match_Email1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
const mergecandidates_match_email1 = /** @type {((inputs?: Mergecandidates_Match_Email1Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mergecandidates_Match_Email1Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_mergecandidates_match_email1(inputs)
	if (locale === "en-XA") return en_xa2_mergecandidates_match_email1(inputs)
	return en_mergecandidates_match_email1(inputs)
});
export { mergecandidates_match_email1 as "mergeCandidates_match_email" }
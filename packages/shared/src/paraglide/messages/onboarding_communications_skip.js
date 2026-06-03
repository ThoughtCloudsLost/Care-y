/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Communications_SkipInputs */

const en_onboarding_communications_skip = /** @type {(inputs: Onboarding_Communications_SkipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Skip for now`)
};

const es_onboarding_communications_skip = /** @type {(inputs: Onboarding_Communications_SkipInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Omitir por ahora`)
};

/**
* | output |
* | --- |
* | "Skip for now" |
*
* @param {Onboarding_Communications_SkipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_communications_skip = /** @type {((inputs?: Onboarding_Communications_SkipInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Communications_SkipInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_communications_skip(inputs)
	return es_onboarding_communications_skip(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Setup_Already_DoneInputs */

const en_onboarding_setup_already_done = /** @type {(inputs: Onboarding_Setup_Already_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This organization has already been set up.`)
};

const es_onboarding_setup_already_done = /** @type {(inputs: Onboarding_Setup_Already_DoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta organizacion ya ha sido configurada.`)
};

/**
* | output |
* | --- |
* | "This organization has already been set up." |
*
* @param {Onboarding_Setup_Already_DoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_already_done = /** @type {((inputs?: Onboarding_Setup_Already_DoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Setup_Already_DoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_setup_already_done(inputs)
	return es_onboarding_setup_already_done(inputs)
});
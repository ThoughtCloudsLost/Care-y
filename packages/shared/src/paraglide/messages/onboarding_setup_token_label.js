/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Setup_Token_LabelInputs */

const en_onboarding_setup_token_label = /** @type {(inputs: Onboarding_Setup_Token_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Setup token`)
};

const es_onboarding_setup_token_label = /** @type {(inputs: Onboarding_Setup_Token_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Token de configuracion`)
};

/**
* | output |
* | --- |
* | "Setup token" |
*
* @param {Onboarding_Setup_Token_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_token_label = /** @type {((inputs?: Onboarding_Setup_Token_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Setup_Token_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_setup_token_label(inputs)
	return es_onboarding_setup_token_label(inputs)
});
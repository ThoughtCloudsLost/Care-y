/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Setup_Token_LabelInputs */

const en_onboarding_setup_token_label = /** @type {(inputs: Onboarding_Setup_Token_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Setup token`)
};

const es_onboarding_setup_token_label = /** @type {(inputs: Onboarding_Setup_Token_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Token de configuración`)
};

const en_xa2_onboarding_setup_token_label = /** @type {(inputs: Onboarding_Setup_Token_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sètùp tòkèn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Setup token" |
*
* @param {Onboarding_Setup_Token_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_token_label = /** @type {((inputs?: Onboarding_Setup_Token_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Setup_Token_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_setup_token_label(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_setup_token_label(inputs)
	return en_onboarding_setup_token_label(inputs)
});
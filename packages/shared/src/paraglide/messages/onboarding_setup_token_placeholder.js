/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Setup_Token_PlaceholderInputs */

const en_onboarding_setup_token_placeholder = /** @type {(inputs: Onboarding_Setup_Token_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Paste your setup token`)
};

const es_onboarding_setup_token_placeholder = /** @type {(inputs: Onboarding_Setup_Token_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pega tu token de configuracion`)
};

/**
* | output |
* | --- |
* | "Paste your setup token" |
*
* @param {Onboarding_Setup_Token_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_token_placeholder = /** @type {((inputs?: Onboarding_Setup_Token_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Setup_Token_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_setup_token_placeholder(inputs)
	return es_onboarding_setup_token_placeholder(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_Display_NameInputs */

const en_onboarding_firstlogin_display_name = /** @type {(inputs: Onboarding_Firstlogin_Display_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Display Name (optional)`)
};

const es_onboarding_firstlogin_display_name = /** @type {(inputs: Onboarding_Firstlogin_Display_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre visible (opcional)`)
};

/**
* | output |
* | --- |
* | "Display Name (optional)" |
*
* @param {Onboarding_Firstlogin_Display_NameInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_display_name = /** @type {((inputs?: Onboarding_Firstlogin_Display_NameInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_Display_NameInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_firstlogin_display_name(inputs)
	return es_onboarding_firstlogin_display_name(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Reauth_MessageInputs */

const en_onboarding_reauth_message = /** @type {(inputs: Onboarding_Reauth_MessageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign back in to unlock your keys and continue setup.`)
};

const es_onboarding_reauth_message = /** @type {(inputs: Onboarding_Reauth_MessageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inicia sesión de nuevo para desbloquear tus claves y continuar la configuración.`)
};

/**
* | output |
* | --- |
* | "Sign back in to unlock your keys and continue setup." |
*
* @param {Onboarding_Reauth_MessageInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_reauth_message = /** @type {((inputs?: Onboarding_Reauth_MessageInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Reauth_MessageInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_reauth_message(inputs)
	return es_onboarding_reauth_message(inputs)
});
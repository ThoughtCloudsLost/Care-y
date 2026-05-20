/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Reauth_MessageInputs */

const en_onboarding_reauth_message = /** @type {(inputs: Onboarding_Reauth_MessageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your encryption keys need to be refreshed. Sign in again to continue setup.`)
};

const es_onboarding_reauth_message = /** @type {(inputs: Onboarding_Reauth_MessageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sus claves de cifrado necesitan actualizarse. Inicie sesion nuevamente para continuar la configuracion.`)
};

/**
* | output |
* | --- |
* | "Your encryption keys need to be refreshed. Sign in again to continue setup." |
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
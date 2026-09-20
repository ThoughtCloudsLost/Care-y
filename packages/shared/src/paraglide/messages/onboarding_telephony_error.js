/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_ErrorInputs */

const en_onboarding_telephony_error = /** @type {(inputs: Onboarding_Telephony_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Failed to save telephony configuration.`)
};

const es_onboarding_telephony_error = /** @type {(inputs: Onboarding_Telephony_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo guardar la configuración de telefonía.`)
};

const en_xa2_onboarding_telephony_error = /** @type {(inputs: Onboarding_Telephony_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fàìlèd tò sàvè tèlèphòny cònfìgùràtìòn. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Failed to save telephony configuration." |
*
* @param {Onboarding_Telephony_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_error = /** @type {((inputs?: Onboarding_Telephony_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_telephony_error(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_telephony_error(inputs)
	return en_onboarding_telephony_error(inputs)
});
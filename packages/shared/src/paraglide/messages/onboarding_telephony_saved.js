/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_SavedInputs */

const en_onboarding_telephony_saved = /** @type {(inputs: Onboarding_Telephony_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telephony configuration saved.`)
};

const es_onboarding_telephony_saved = /** @type {(inputs: Onboarding_Telephony_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configuración de telefonía guardada.`)
};

const en_xa2_onboarding_telephony_saved = /** @type {(inputs: Onboarding_Telephony_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèlèphòny cònfìgùràtìòn sàvèd. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Telephony configuration saved." |
*
* @param {Onboarding_Telephony_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_saved = /** @type {((inputs?: Onboarding_Telephony_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_telephony_saved(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_telephony_saved(inputs)
	return en_onboarding_telephony_saved(inputs)
});
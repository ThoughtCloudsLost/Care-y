/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_SavedInputs */

const en_onboarding_telephony_saved = /** @type {(inputs: Onboarding_Telephony_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telephony configuration saved.`)
};

const es_onboarding_telephony_saved = /** @type {(inputs: Onboarding_Telephony_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configuracion de telefonia guardada.`)
};

/**
* | output |
* | --- |
* | "Telephony configuration saved." |
*
* @param {Onboarding_Telephony_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_saved = /** @type {((inputs?: Onboarding_Telephony_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_telephony_saved(inputs)
	return es_onboarding_telephony_saved(inputs)
});
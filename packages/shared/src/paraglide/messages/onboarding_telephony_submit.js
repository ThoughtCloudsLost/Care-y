/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_SubmitInputs */

const en_onboarding_telephony_submit = /** @type {(inputs: Onboarding_Telephony_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save Telephony Choice`)
};

const es_onboarding_telephony_submit = /** @type {(inputs: Onboarding_Telephony_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar configuracion de telefonia`)
};

/**
* | output |
* | --- |
* | "Save Telephony Choice" |
*
* @param {Onboarding_Telephony_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_submit = /** @type {((inputs?: Onboarding_Telephony_SubmitInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_SubmitInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_telephony_submit(inputs)
	return es_onboarding_telephony_submit(inputs)
});
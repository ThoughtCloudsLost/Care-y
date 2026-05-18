/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Twofa_At_Least_OneInputs */

const en_onboarding_twofa_at_least_one = /** @type {(inputs: Onboarding_Twofa_At_Least_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enroll at least one method to continue.`)
};

const es_onboarding_twofa_at_least_one = /** @type {(inputs: Onboarding_Twofa_At_Least_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registra al menos un metodo para continuar.`)
};

/**
* | output |
* | --- |
* | "Enroll at least one method to continue." |
*
* @param {Onboarding_Twofa_At_Least_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_at_least_one = /** @type {((inputs?: Onboarding_Twofa_At_Least_OneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Twofa_At_Least_OneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_twofa_at_least_one(inputs)
	return es_onboarding_twofa_at_least_one(inputs)
});
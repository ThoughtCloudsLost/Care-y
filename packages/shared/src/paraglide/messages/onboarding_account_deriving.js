/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Account_DerivingInputs */

const en_onboarding_account_deriving = /** @type {(inputs: Onboarding_Account_DerivingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Creating your keys...`)
};

const es_onboarding_account_deriving = /** @type {(inputs: Onboarding_Account_DerivingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Creando tus claves...`)
};

/**
* | output |
* | --- |
* | "Creating your keys..." |
*
* @param {Onboarding_Account_DerivingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_deriving = /** @type {((inputs?: Onboarding_Account_DerivingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_DerivingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_account_deriving(inputs)
	return es_onboarding_account_deriving(inputs)
});
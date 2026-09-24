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

const en_xa2_onboarding_account_deriving = /** @type {(inputs: Onboarding_Account_DerivingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtìng yòùr kèys... •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Creating your keys..." |
*
* @param {Onboarding_Account_DerivingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_deriving = /** @type {((inputs?: Onboarding_Account_DerivingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_DerivingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_account_deriving(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_account_deriving(inputs)
	return en_onboarding_account_deriving(inputs)
});
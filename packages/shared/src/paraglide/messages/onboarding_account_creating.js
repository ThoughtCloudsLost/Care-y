/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Account_CreatingInputs */

const en_onboarding_account_creating = /** @type {(inputs: Onboarding_Account_CreatingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Creating account...`)
};

const es_onboarding_account_creating = /** @type {(inputs: Onboarding_Account_CreatingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Creando cuenta...`)
};

/**
* | output |
* | --- |
* | "Creating account..." |
*
* @param {Onboarding_Account_CreatingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_creating = /** @type {((inputs?: Onboarding_Account_CreatingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_CreatingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_account_creating(inputs)
	return es_onboarding_account_creating(inputs)
});
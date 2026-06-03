/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Account_HeadingInputs */

const en_onboarding_account_heading = /** @type {(inputs: Onboarding_Account_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create Your Admin Account`)
};

const es_onboarding_account_heading = /** @type {(inputs: Onboarding_Account_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crea tu cuenta de administrador`)
};

/**
* | output |
* | --- |
* | "Create Your Admin Account" |
*
* @param {Onboarding_Account_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_heading = /** @type {((inputs?: Onboarding_Account_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_account_heading(inputs)
	return es_onboarding_account_heading(inputs)
});
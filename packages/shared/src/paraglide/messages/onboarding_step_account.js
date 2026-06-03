/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Step_AccountInputs */

const en_onboarding_step_account = /** @type {(inputs: Onboarding_Step_AccountInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account`)
};

const es_onboarding_step_account = /** @type {(inputs: Onboarding_Step_AccountInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuenta`)
};

/**
* | output |
* | --- |
* | "Account" |
*
* @param {Onboarding_Step_AccountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_account = /** @type {((inputs?: Onboarding_Step_AccountInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Step_AccountInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_step_account(inputs)
	return es_onboarding_step_account(inputs)
});
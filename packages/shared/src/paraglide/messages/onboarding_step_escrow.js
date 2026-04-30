/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Step_EscrowInputs */

const en_onboarding_step_escrow = /** @type {(inputs: Onboarding_Step_EscrowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Backup`)
};

const es_onboarding_step_escrow = /** @type {(inputs: Onboarding_Step_EscrowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respaldo`)
};

/**
* | output |
* | --- |
* | "Backup" |
*
* @param {Onboarding_Step_EscrowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_escrow = /** @type {((inputs?: Onboarding_Step_EscrowInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Step_EscrowInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_step_escrow(inputs)
	return es_onboarding_step_escrow(inputs)
});
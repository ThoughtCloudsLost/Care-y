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

const en_xa2_onboarding_step_escrow = /** @type {(inputs: Onboarding_Step_EscrowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bàckùp ••⟧`)
};

/**
* | output |
* | --- |
* | "Backup" |
*
* @param {Onboarding_Step_EscrowInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_escrow = /** @type {((inputs?: Onboarding_Step_EscrowInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Step_EscrowInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_step_escrow(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_step_escrow(inputs)
	return en_onboarding_step_escrow(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_ContinueInputs */

const en_onboarding_escrow_continue = /** @type {(inputs: Onboarding_Escrow_ContinueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Continue`)
};

const es_onboarding_escrow_continue = /** @type {(inputs: Onboarding_Escrow_ContinueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Continuar`)
};

/**
* | output |
* | --- |
* | "Continue" |
*
* @param {Onboarding_Escrow_ContinueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_continue = /** @type {((inputs?: Onboarding_Escrow_ContinueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_ContinueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_continue(inputs)
	return es_onboarding_escrow_continue(inputs)
});
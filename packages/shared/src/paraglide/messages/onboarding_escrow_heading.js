/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_HeadingInputs */

const en_onboarding_escrow_heading = /** @type {(inputs: Onboarding_Escrow_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Back Up Your Encryption Keys`)
};

const es_onboarding_escrow_heading = /** @type {(inputs: Onboarding_Escrow_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respalde sus claves de cifrado`)
};

/**
* | output |
* | --- |
* | "Back Up Your Encryption Keys" |
*
* @param {Onboarding_Escrow_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_heading = /** @type {((inputs?: Onboarding_Escrow_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_heading(inputs)
	return es_onboarding_escrow_heading(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Placeholder_Heading_EscrowInputs */

const en_onboarding_placeholder_heading_escrow = /** @type {(inputs: Onboarding_Placeholder_Heading_EscrowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escrow Backup`)
};

const es_onboarding_placeholder_heading_escrow = /** @type {(inputs: Onboarding_Placeholder_Heading_EscrowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respaldo de custodia`)
};

/**
* | output |
* | --- |
* | "Escrow Backup" |
*
* @param {Onboarding_Placeholder_Heading_EscrowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_placeholder_heading_escrow = /** @type {((inputs?: Onboarding_Placeholder_Heading_EscrowInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Placeholder_Heading_EscrowInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_placeholder_heading_escrow(inputs)
	return es_onboarding_placeholder_heading_escrow(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_ErrorInputs */

const en_onboarding_org_error = /** @type {(inputs: Onboarding_Org_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Failed to save organization details.`)
};

const es_onboarding_org_error = /** @type {(inputs: Onboarding_Org_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudieron guardar los detalles de la organizacion.`)
};

/**
* | output |
* | --- |
* | "Failed to save organization details." |
*
* @param {Onboarding_Org_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_error = /** @type {((inputs?: Onboarding_Org_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_org_error(inputs)
	return es_onboarding_org_error(inputs)
});
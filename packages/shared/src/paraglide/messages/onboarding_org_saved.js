/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_SavedInputs */

const en_onboarding_org_saved = /** @type {(inputs: Onboarding_Org_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization details saved.`)
};

const es_onboarding_org_saved = /** @type {(inputs: Onboarding_Org_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Detalles de la organizacion guardados.`)
};

/**
* | output |
* | --- |
* | "Organization details saved." |
*
* @param {Onboarding_Org_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_saved = /** @type {((inputs?: Onboarding_Org_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_org_saved(inputs)
	return es_onboarding_org_saved(inputs)
});
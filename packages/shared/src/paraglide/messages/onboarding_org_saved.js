/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_SavedInputs */

const en_onboarding_org_saved = /** @type {(inputs: Onboarding_Org_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization details saved.`)
};

const es_onboarding_org_saved = /** @type {(inputs: Onboarding_Org_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Detalles de la organización guardados.`)
};

const en_xa2_onboarding_org_saved = /** @type {(inputs: Onboarding_Org_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòn dètàìls sàvèd. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Organization details saved." |
*
* @param {Onboarding_Org_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_saved = /** @type {((inputs?: Onboarding_Org_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_org_saved(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_org_saved(inputs)
	return en_onboarding_org_saved(inputs)
});
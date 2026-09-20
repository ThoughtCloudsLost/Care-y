/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_HeadingInputs */

const en_onboarding_org_heading = /** @type {(inputs: Onboarding_Org_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization Details`)
};

const es_onboarding_org_heading = /** @type {(inputs: Onboarding_Org_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Detalles de la organización`)
};

const en_xa2_onboarding_org_heading = /** @type {(inputs: Onboarding_Org_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòn Dètàìls ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Organization Details" |
*
* @param {Onboarding_Org_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_heading = /** @type {((inputs?: Onboarding_Org_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_org_heading(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_org_heading(inputs)
	return en_onboarding_org_heading(inputs)
});
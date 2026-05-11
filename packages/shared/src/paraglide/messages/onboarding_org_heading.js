/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_HeadingInputs */

const en_onboarding_org_heading = /** @type {(inputs: Onboarding_Org_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization Details`)
};

const es_onboarding_org_heading = /** @type {(inputs: Onboarding_Org_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Detalles de la organizacion`)
};

/**
* | output |
* | --- |
* | "Organization Details" |
*
* @param {Onboarding_Org_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_heading = /** @type {((inputs?: Onboarding_Org_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_org_heading(inputs)
	return es_onboarding_org_heading(inputs)
});
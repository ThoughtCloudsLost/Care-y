/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Communications_HeadingInputs */

const en_onboarding_communications_heading = /** @type {(inputs: Onboarding_Communications_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Communications`)
};

const es_onboarding_communications_heading = /** @type {(inputs: Onboarding_Communications_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Comunicaciones`)
};

const en_xa2_onboarding_communications_heading = /** @type {(inputs: Onboarding_Communications_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còmmùnìcàtìòns •••••⟧`)
};

/**
* | output |
* | --- |
* | "Communications" |
*
* @param {Onboarding_Communications_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_communications_heading = /** @type {((inputs?: Onboarding_Communications_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Communications_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_communications_heading(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_communications_heading(inputs)
	return en_onboarding_communications_heading(inputs)
});
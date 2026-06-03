/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_BrandingInputs */

const en_getting_started_branding = /** @type {(inputs: Getting_Started_BrandingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Customize branding`)
};

const es_getting_started_branding = /** @type {(inputs: Getting_Started_BrandingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Personalizar la marca`)
};

/**
* | output |
* | --- |
* | "Customize branding" |
*
* @param {Getting_Started_BrandingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_branding = /** @type {((inputs?: Getting_Started_BrandingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_BrandingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_branding(inputs)
	return es_getting_started_branding(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_Branding_DescInputs */

const en_getting_started_branding_desc = /** @type {(inputs: Getting_Started_Branding_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Upload a logo and set your organization's colors.`)
};

const es_getting_started_branding_desc = /** @type {(inputs: Getting_Started_Branding_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sube un logo y configura los colores de tu organización.`)
};

const en_xa2_getting_started_branding_desc = /** @type {(inputs: Getting_Started_Branding_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùplòàd à lògò ànd sèt yòùr òrgànìzàtìòn's còlòrs. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Upload a logo and set your organization's colors." |
*
* @param {Getting_Started_Branding_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_branding_desc = /** @type {((inputs?: Getting_Started_Branding_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_Branding_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_getting_started_branding_desc(inputs)
	if (locale === "en-XA") return en_xa2_getting_started_branding_desc(inputs)
	return en_getting_started_branding_desc(inputs)
});
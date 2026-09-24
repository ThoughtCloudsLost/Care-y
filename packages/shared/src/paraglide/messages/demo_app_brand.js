/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_App_BrandInputs */

const en_demo_app_brand = /** @type {(inputs: Demo_App_BrandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`CARE-Y`)
};

const es_demo_app_brand = /** @type {(inputs: Demo_App_BrandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`CARE-Y`)
};

const en_xa2_demo_app_brand = /** @type {(inputs: Demo_App_BrandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦CÀRÈ-Y ••⟧`)
};

/**
* | output |
* | --- |
* | "CARE-Y" |
*
* @param {Demo_App_BrandInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_app_brand = /** @type {((inputs?: Demo_App_BrandInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_App_BrandInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_app_brand(inputs)
	if (locale === "en-XA") return en_xa2_demo_app_brand(inputs)
	return en_demo_app_brand(inputs)
});
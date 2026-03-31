/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} App_NameInputs */

const en_app_name = /** @type {(inputs: App_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`CARE-Y`)
};

const es_app_name = /** @type {(inputs: App_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`CARE-Y`)
};

/**
* | output |
* | --- |
* | "CARE-Y" |
*
* @param {App_NameInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const app_name = /** @type {((inputs?: App_NameInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<App_NameInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_app_name(inputs)
	return es_app_name(inputs)
});
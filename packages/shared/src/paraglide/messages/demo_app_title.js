/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_App_TitleInputs */

const en_demo_app_title = /** @type {(inputs: Demo_App_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Interactive Handbook`)
};

const es_demo_app_title = /** @type {(inputs: Demo_App_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manual interactivo`)
};

/**
* | output |
* | --- |
* | "Interactive Handbook" |
*
* @param {Demo_App_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_app_title = /** @type {((inputs?: Demo_App_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_App_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_app_title(inputs)
	return es_demo_app_title(inputs)
});
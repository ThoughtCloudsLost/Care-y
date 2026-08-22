/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_PreparingInputs */

const en_demo_preparing = /** @type {(inputs: Demo_PreparingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`One moment, preparing the handbook. The app is signing in and deriving encryption keys in the background.`)
};

const es_demo_preparing = /** @type {(inputs: Demo_PreparingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un momento, preparando el manual. La aplicación está iniciando sesión y derivando las claves de cifrado en segundo plano.`)
};

/**
* | output |
* | --- |
* | "One moment, preparing the handbook. The app is signing in and deriving encryption keys in the background." |
*
* @param {Demo_PreparingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_preparing = /** @type {((inputs?: Demo_PreparingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_PreparingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_preparing(inputs)
	return es_demo_preparing(inputs)
});
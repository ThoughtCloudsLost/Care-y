/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Tap_HintInputs */

const en_demo_tap_hint = /** @type {(inputs: Demo_Tap_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tap to continue`)
};

const es_demo_tap_hint = /** @type {(inputs: Demo_Tap_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toca para continuar`)
};

/**
* | output |
* | --- |
* | "Tap to continue" |
*
* @param {Demo_Tap_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_tap_hint = /** @type {((inputs?: Demo_Tap_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Tap_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_tap_hint(inputs)
	return es_demo_tap_hint(inputs)
});
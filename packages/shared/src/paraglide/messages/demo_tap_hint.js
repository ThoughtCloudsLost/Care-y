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

const en_xa2_demo_tap_hint = /** @type {(inputs: Demo_Tap_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàp tò còntìnùè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Tap to continue" |
*
* @param {Demo_Tap_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_tap_hint = /** @type {((inputs?: Demo_Tap_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Tap_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_tap_hint(inputs)
	if (locale === "en-XA") return en_xa2_demo_tap_hint(inputs)
	return en_demo_tap_hint(inputs)
});
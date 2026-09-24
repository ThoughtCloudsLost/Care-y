/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Excursion_BackInputs */

const en_demo_excursion_back = /** @type {(inputs: Demo_Excursion_BackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Back to handbook`)
};

const es_demo_excursion_back = /** @type {(inputs: Demo_Excursion_BackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volver al manual`)
};

const en_xa2_demo_excursion_back = /** @type {(inputs: Demo_Excursion_BackInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bàck tò hàndbòòk •••••⟧`)
};

/**
* | output |
* | --- |
* | "Back to handbook" |
*
* @param {Demo_Excursion_BackInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_excursion_back = /** @type {((inputs?: Demo_Excursion_BackInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Excursion_BackInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_excursion_back(inputs)
	if (locale === "en-XA") return en_xa2_demo_excursion_back(inputs)
	return en_demo_excursion_back(inputs)
});
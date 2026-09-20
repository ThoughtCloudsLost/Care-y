/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_More_MenuInputs */

const en_demo_more_menu = /** @type {(inputs: Demo_More_MenuInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`More options`)
};

const es_demo_more_menu = /** @type {(inputs: Demo_More_MenuInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Más opciones`)
};

const en_xa2_demo_more_menu = /** @type {(inputs: Demo_More_MenuInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mòrè òptìòns ••••⟧`)
};

/**
* | output |
* | --- |
* | "More options" |
*
* @param {Demo_More_MenuInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_more_menu = /** @type {((inputs?: Demo_More_MenuInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_More_MenuInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_more_menu(inputs)
	if (locale === "en-XA") return en_xa2_demo_more_menu(inputs)
	return en_demo_more_menu(inputs)
});
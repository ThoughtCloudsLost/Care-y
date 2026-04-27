/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_GreetingsInputs */

const en_panel_greetings = /** @type {(inputs: Panel_GreetingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Greetings`)
};

const es_panel_greetings = /** @type {(inputs: Panel_GreetingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saludos`)
};

/**
* | output |
* | --- |
* | "Greetings" |
*
* @param {Panel_GreetingsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_greetings = /** @type {((inputs?: Panel_GreetingsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_GreetingsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_greetings(inputs)
	return es_panel_greetings(inputs)
});
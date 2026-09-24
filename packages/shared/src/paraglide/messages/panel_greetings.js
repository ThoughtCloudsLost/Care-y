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

const en_xa2_panel_greetings = /** @type {(inputs: Panel_GreetingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Grèètìngs •••⟧`)
};

/**
* | output |
* | --- |
* | "Greetings" |
*
* @param {Panel_GreetingsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_greetings = /** @type {((inputs?: Panel_GreetingsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_GreetingsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_panel_greetings(inputs)
	if (locale === "en-XA") return en_xa2_panel_greetings(inputs)
	return en_panel_greetings(inputs)
});
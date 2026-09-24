/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_GreetingsInputs */

const en_getting_started_greetings = /** @type {(inputs: Getting_Started_GreetingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set up phone greetings`)
};

const es_getting_started_greetings = /** @type {(inputs: Getting_Started_GreetingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurar saludos telefónicos`)
};

const en_xa2_getting_started_greetings = /** @type {(inputs: Getting_Started_GreetingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèt ùp phònè grèètìngs •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Set up phone greetings" |
*
* @param {Getting_Started_GreetingsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_greetings = /** @type {((inputs?: Getting_Started_GreetingsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_GreetingsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_getting_started_greetings(inputs)
	if (locale === "en-XA") return en_xa2_getting_started_greetings(inputs)
	return en_getting_started_greetings(inputs)
});
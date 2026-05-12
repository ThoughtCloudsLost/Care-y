/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_GreetingsInputs */

const en_getting_started_greetings = /** @type {(inputs: Getting_Started_GreetingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set up phone greetings`)
};

const es_getting_started_greetings = /** @type {(inputs: Getting_Started_GreetingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurar saludos telefonicos`)
};

/**
* | output |
* | --- |
* | "Set up phone greetings" |
*
* @param {Getting_Started_GreetingsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_greetings = /** @type {((inputs?: Getting_Started_GreetingsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_GreetingsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_greetings(inputs)
	return es_getting_started_greetings(inputs)
});
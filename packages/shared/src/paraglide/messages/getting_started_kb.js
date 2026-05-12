/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_KbInputs */

const en_getting_started_kb = /** @type {(inputs: Getting_Started_KbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add knowledge base articles`)
};

const es_getting_started_kb = /** @type {(inputs: Getting_Started_KbInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar articulos a la base de conocimiento`)
};

/**
* | output |
* | --- |
* | "Add knowledge base articles" |
*
* @param {Getting_Started_KbInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_kb = /** @type {((inputs?: Getting_Started_KbInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_KbInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_kb(inputs)
	return es_getting_started_kb(inputs)
});
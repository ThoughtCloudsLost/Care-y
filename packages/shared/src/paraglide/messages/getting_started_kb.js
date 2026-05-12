/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ knowledgeBase: NonNullable<unknown> }} Getting_Started_KbInputs */

const en_getting_started_kb = /** @type {(inputs: Getting_Started_KbInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Add ${i?.knowledgeBase} articles`)
};

const es_getting_started_kb = /** @type {(inputs: Getting_Started_KbInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Agregar articulos a la ${i?.knowledgeBase}`)
};

/**
* | output |
* | --- |
* | "Add {knowledgeBase} articles" |
*
* @param {Getting_Started_KbInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_kb = /** @type {((inputs: Getting_Started_KbInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_KbInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_kb(inputs)
	return es_getting_started_kb(inputs)
});
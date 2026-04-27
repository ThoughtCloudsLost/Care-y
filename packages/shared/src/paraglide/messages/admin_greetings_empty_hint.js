/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_Empty_HintInputs */

const en_admin_greetings_empty_hint = /** @type {(inputs: Admin_Greetings_Empty_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tap Add greeting to create one.`)
};

const es_admin_greetings_empty_hint = /** @type {(inputs: Admin_Greetings_Empty_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toca Agregar saludo para crear uno.`)
};

/**
* | output |
* | --- |
* | "Tap Add greeting to create one." |
*
* @param {Admin_Greetings_Empty_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_empty_hint = /** @type {((inputs?: Admin_Greetings_Empty_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_Empty_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_empty_hint(inputs)
	return es_admin_greetings_empty_hint(inputs)
});
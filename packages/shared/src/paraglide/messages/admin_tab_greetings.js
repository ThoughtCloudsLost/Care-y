/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_GreetingsInputs */

const en_admin_tab_greetings = /** @type {(inputs: Admin_Tab_GreetingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Greetings`)
};

const es_admin_tab_greetings = /** @type {(inputs: Admin_Tab_GreetingsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saludos`)
};

/**
* | output |
* | --- |
* | "Greetings" |
*
* @param {Admin_Tab_GreetingsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_greetings = /** @type {((inputs?: Admin_Tab_GreetingsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_GreetingsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_tab_greetings(inputs)
	return es_admin_tab_greetings(inputs)
});
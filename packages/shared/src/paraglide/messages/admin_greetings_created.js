/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_CreatedInputs */

const en_admin_greetings_created = /** @type {(inputs: Admin_Greetings_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Greeting created.`)
};

const es_admin_greetings_created = /** @type {(inputs: Admin_Greetings_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saludo creado.`)
};

/**
* | output |
* | --- |
* | "Greeting created." |
*
* @param {Admin_Greetings_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_created = /** @type {((inputs?: Admin_Greetings_CreatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_CreatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_greetings_created(inputs)
	return es_admin_greetings_created(inputs)
});
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

const en_xa2_admin_greetings_created = /** @type {(inputs: Admin_Greetings_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Grèètìng crèàtèd. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Greeting created." |
*
* @param {Admin_Greetings_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_created = /** @type {((inputs?: Admin_Greetings_CreatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_CreatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_created(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_created(inputs)
	return en_admin_greetings_created(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_SavedInputs */

const en_admin_greetings_saved = /** @type {(inputs: Admin_Greetings_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Greeting saved.`)
};

const es_admin_greetings_saved = /** @type {(inputs: Admin_Greetings_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saludo guardado.`)
};

const en_xa2_admin_greetings_saved = /** @type {(inputs: Admin_Greetings_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Grèètìng sàvèd. •••••⟧`)
};

/**
* | output |
* | --- |
* | "Greeting saved." |
*
* @param {Admin_Greetings_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_saved = /** @type {((inputs?: Admin_Greetings_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_saved(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_saved(inputs)
	return en_admin_greetings_saved(inputs)
});
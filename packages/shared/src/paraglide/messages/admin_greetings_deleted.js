/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_DeletedInputs */

const en_admin_greetings_deleted = /** @type {(inputs: Admin_Greetings_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Greeting deleted.`)
};

const es_admin_greetings_deleted = /** @type {(inputs: Admin_Greetings_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saludo eliminado.`)
};

const en_xa2_admin_greetings_deleted = /** @type {(inputs: Admin_Greetings_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Grèètìng dèlètèd. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Greeting deleted." |
*
* @param {Admin_Greetings_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_deleted = /** @type {((inputs?: Admin_Greetings_DeletedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_DeletedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_deleted(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_deleted(inputs)
	return en_admin_greetings_deleted(inputs)
});
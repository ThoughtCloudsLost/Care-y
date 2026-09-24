/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_EmptyInputs */

const en_admin_greetings_empty = /** @type {(inputs: Admin_Greetings_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No greetings yet.`)
};

const es_admin_greetings_empty = /** @type {(inputs: Admin_Greetings_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aún no hay saludos.`)
};

const en_xa2_admin_greetings_empty = /** @type {(inputs: Admin_Greetings_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò grèètìngs yèt. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "No greetings yet." |
*
* @param {Admin_Greetings_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_empty = /** @type {((inputs?: Admin_Greetings_EmptyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_EmptyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_empty(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_empty(inputs)
	return en_admin_greetings_empty(inputs)
});
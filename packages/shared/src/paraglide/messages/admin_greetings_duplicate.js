/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Greetings_DuplicateInputs */

const en_admin_greetings_duplicate = /** @type {(inputs: Admin_Greetings_DuplicateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A greeting with this type and language already exists.`)
};

const es_admin_greetings_duplicate = /** @type {(inputs: Admin_Greetings_DuplicateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ya existe un saludo con este tipo e idioma.`)
};

const en_xa2_admin_greetings_duplicate = /** @type {(inputs: Admin_Greetings_DuplicateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À grèètìng wìth thìs typè ànd làngùàgè àlrèàdy èxìsts. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A greeting with this type and language already exists." |
*
* @param {Admin_Greetings_DuplicateInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_greetings_duplicate = /** @type {((inputs?: Admin_Greetings_DuplicateInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Greetings_DuplicateInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_greetings_duplicate(inputs)
	if (locale === "en-XA") return en_xa2_admin_greetings_duplicate(inputs)
	return en_admin_greetings_duplicate(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_Form_TitleInputs */

const en_portal_passphrase_form_title = /** @type {(inputs: Portal_Passphrase_Form_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add a password`)
};

const es_portal_passphrase_form_title = /** @type {(inputs: Portal_Passphrase_Form_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar una contraseña`)
};

/**
* | output |
* | --- |
* | "Add a password" |
*
* @param {Portal_Passphrase_Form_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_form_title = /** @type {((inputs?: Portal_Passphrase_Form_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Form_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_form_title(inputs)
	return en_portal_passphrase_form_title(inputs)
});
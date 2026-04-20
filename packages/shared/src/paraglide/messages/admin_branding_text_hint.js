/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Text_HintInputs */

const en_admin_branding_text_hint = /** @type {(inputs: Admin_Branding_Text_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shown on the client intake form.`)
};

const es_admin_branding_text_hint = /** @type {(inputs: Admin_Branding_Text_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mostrado en el formulario de admision de clientes.`)
};

/**
* | output |
* | --- |
* | "Shown on the client intake form." |
*
* @param {Admin_Branding_Text_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_text_hint = /** @type {((inputs?: Admin_Branding_Text_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Text_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_text_hint(inputs)
	return es_admin_branding_text_hint(inputs)
});
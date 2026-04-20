/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Name_HintInputs */

const en_admin_branding_name_hint = /** @type {(inputs: Admin_Branding_Name_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shown to volunteers and clients.`)
};

const es_admin_branding_name_hint = /** @type {(inputs: Admin_Branding_Name_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mostrado a voluntarios y clientes.`)
};

/**
* | output |
* | --- |
* | "Shown to volunteers and clients." |
*
* @param {Admin_Branding_Name_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_name_hint = /** @type {((inputs?: Admin_Branding_Name_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Name_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_name_hint(inputs)
	return es_admin_branding_name_hint(inputs)
});
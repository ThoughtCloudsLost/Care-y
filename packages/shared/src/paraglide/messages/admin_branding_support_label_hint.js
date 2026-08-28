/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Branding_Support_Label_HintInputs */

const en_admin_branding_support_label_hint = /** @type {(inputs: Admin_Branding_Support_Label_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shown above every message you send in the client portal. Use your organization's own words. Leave it empty to keep the default. Never put a volunteer's name here: clients see this, and it is the same for everyone on your team.`)
};

const es_admin_branding_support_label_hint = /** @type {(inputs: Admin_Branding_Support_Label_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se muestra encima de cada mensaje que envías en el portal del cliente. Usa las palabras de tu organización. Déjalo vacío para conservar el valor predeterminado. Nunca pongas aquí el nombre de una persona voluntaria: los clientes lo ven y es el mismo para todo tu equipo.`)
};

/**
* | output |
* | --- |
* | "Shown above every message you send in the client portal. Use your organization's own words. Leave it empty to keep the default. Never put a volunteer's name ..." |
*
* @param {Admin_Branding_Support_Label_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_support_label_hint = /** @type {((inputs?: Admin_Branding_Support_Label_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Branding_Support_Label_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_branding_support_label_hint(inputs)
	return es_admin_branding_support_label_hint(inputs)
});
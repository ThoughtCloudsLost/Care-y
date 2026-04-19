/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Tab_Sms_TemplatesInputs */

const en_admin_tab_sms_templates = /** @type {(inputs: Admin_Tab_Sms_TemplatesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS Templates`)
};

const es_admin_tab_sms_templates = /** @type {(inputs: Admin_Tab_Sms_TemplatesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plantillas SMS`)
};

/**
* | output |
* | --- |
* | "SMS Templates" |
*
* @param {Admin_Tab_Sms_TemplatesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_tab_sms_templates = /** @type {((inputs?: Admin_Tab_Sms_TemplatesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Tab_Sms_TemplatesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_tab_sms_templates(inputs)
	return es_admin_tab_sms_templates(inputs)
});
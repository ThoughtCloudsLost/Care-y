/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_Sms_TemplatesInputs */

const en_panel_sms_templates = /** @type {(inputs: Panel_Sms_TemplatesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS Templates`)
};

const es_panel_sms_templates = /** @type {(inputs: Panel_Sms_TemplatesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plantillas SMS`)
};

/**
* | output |
* | --- |
* | "SMS Templates" |
*
* @param {Panel_Sms_TemplatesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_sms_templates = /** @type {((inputs?: Panel_Sms_TemplatesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_Sms_TemplatesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_sms_templates(inputs)
	return es_panel_sms_templates(inputs)
});
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

const en_xa2_panel_sms_templates = /** @type {(inputs: Panel_Sms_TemplatesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦SMS Tèmplàtès ••••⟧`)
};

/**
* | output |
* | --- |
* | "SMS Templates" |
*
* @param {Panel_Sms_TemplatesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_sms_templates = /** @type {((inputs?: Panel_Sms_TemplatesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_Sms_TemplatesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_panel_sms_templates(inputs)
	if (locale === "en-XA") return en_xa2_panel_sms_templates(inputs)
	return en_panel_sms_templates(inputs)
});
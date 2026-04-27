/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Sms_Templates_SubtitleInputs */

const en_hub_sms_templates_subtitle = /** @type {(inputs: Hub_Sms_Templates_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Automated SMS message templates`)
};

const es_hub_sms_templates_subtitle = /** @type {(inputs: Hub_Sms_Templates_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plantillas de mensajes SMS automatizados`)
};

/**
* | output |
* | --- |
* | "Automated SMS message templates" |
*
* @param {Hub_Sms_Templates_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_sms_templates_subtitle = /** @type {((inputs?: Hub_Sms_Templates_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Sms_Templates_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_sms_templates_subtitle(inputs)
	return es_hub_sms_templates_subtitle(inputs)
});
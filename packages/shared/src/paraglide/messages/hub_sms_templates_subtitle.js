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

const en_xa2_hub_sms_templates_subtitle = /** @type {(inputs: Hub_Sms_Templates_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àùtòmàtèd SMS mèssàgè tèmplàtès ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Automated SMS message templates" |
*
* @param {Hub_Sms_Templates_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_sms_templates_subtitle = /** @type {((inputs?: Hub_Sms_Templates_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Sms_Templates_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_hub_sms_templates_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_hub_sms_templates_subtitle(inputs)
	return en_hub_sms_templates_subtitle(inputs)
});
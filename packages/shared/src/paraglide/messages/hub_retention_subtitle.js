/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Retention_SubtitleInputs */

const en_hub_retention_subtitle = /** @type {(inputs: Hub_Retention_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`PII retention and data lifecycle`)
};

const es_hub_retention_subtitle = /** @type {(inputs: Hub_Retention_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retencion de PII y ciclo de vida de datos`)
};

/**
* | output |
* | --- |
* | "PII retention and data lifecycle" |
*
* @param {Hub_Retention_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_retention_subtitle = /** @type {((inputs?: Hub_Retention_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Retention_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_retention_subtitle(inputs)
	return es_hub_retention_subtitle(inputs)
});
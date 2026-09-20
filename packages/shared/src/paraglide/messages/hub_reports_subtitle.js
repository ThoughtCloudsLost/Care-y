/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Reports_SubtitleInputs */

const en_hub_reports_subtitle = /** @type {(inputs: Hub_Reports_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usage statistics and activity reports`)
};

const es_hub_reports_subtitle = /** @type {(inputs: Hub_Reports_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estadísticas de uso e informes de actividad`)
};

const en_xa2_hub_reports_subtitle = /** @type {(inputs: Hub_Reports_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùsàgè stàtìstìcs ànd àctìvìty rèpòrts ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Usage statistics and activity reports" |
*
* @param {Hub_Reports_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_reports_subtitle = /** @type {((inputs?: Hub_Reports_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Reports_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_hub_reports_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_hub_reports_subtitle(inputs)
	return en_hub_reports_subtitle(inputs)
});
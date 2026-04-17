/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Reports_SubtitleInputs */

const en_hub_reports_subtitle = /** @type {(inputs: Hub_Reports_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usage statistics and activity reports`)
};

const es_hub_reports_subtitle = /** @type {(inputs: Hub_Reports_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estadisticas de uso e informes de actividad`)
};

/**
* | output |
* | --- |
* | "Usage statistics and activity reports" |
*
* @param {Hub_Reports_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_reports_subtitle = /** @type {((inputs?: Hub_Reports_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Reports_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_reports_subtitle(inputs)
	return es_hub_reports_subtitle(inputs)
});
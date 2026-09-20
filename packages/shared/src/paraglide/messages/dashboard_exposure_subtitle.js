/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Exposure_SubtitleInputs */

const en_dashboard_exposure_subtitle = /** @type {(inputs: Dashboard_Exposure_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Checking your protection status...`)
};

const es_dashboard_exposure_subtitle = /** @type {(inputs: Dashboard_Exposure_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verificando tu estado de protección...`)
};

const en_xa2_dashboard_exposure_subtitle = /** @type {(inputs: Dashboard_Exposure_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chèckìng yòùr pròtèctìòn stàtùs... •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Checking your protection status..." |
*
* @param {Dashboard_Exposure_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_exposure_subtitle = /** @type {((inputs?: Dashboard_Exposure_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Exposure_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_exposure_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_exposure_subtitle(inputs)
	return en_dashboard_exposure_subtitle(inputs)
});
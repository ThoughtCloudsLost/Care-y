/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Exposure_TitleInputs */

const en_dashboard_exposure_title = /** @type {(inputs: Dashboard_Exposure_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Security Summary`)
};

const es_dashboard_exposure_title = /** @type {(inputs: Dashboard_Exposure_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resumen de seguridad`)
};

const en_xa2_dashboard_exposure_title = /** @type {(inputs: Dashboard_Exposure_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sècùrìty Sùmmàry •••••⟧`)
};

/**
* | output |
* | --- |
* | "Security Summary" |
*
* @param {Dashboard_Exposure_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_exposure_title = /** @type {((inputs?: Dashboard_Exposure_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Exposure_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_exposure_title(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_exposure_title(inputs)
	return en_dashboard_exposure_title(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_ReportsInputs */

const en_panel_reports = /** @type {(inputs: Panel_ReportsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reports`)
};

const es_panel_reports = /** @type {(inputs: Panel_ReportsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Informes`)
};

/**
* | output |
* | --- |
* | "Reports" |
*
* @param {Panel_ReportsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_reports = /** @type {((inputs?: Panel_ReportsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_ReportsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_reports(inputs)
	return es_panel_reports(inputs)
});
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

const en_xa2_panel_reports = /** @type {(inputs: Panel_ReportsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèpòrts •••⟧`)
};

/**
* | output |
* | --- |
* | "Reports" |
*
* @param {Panel_ReportsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_reports = /** @type {((inputs?: Panel_ReportsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_ReportsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_panel_reports(inputs)
	if (locale === "en-XA") return en_xa2_panel_reports(inputs)
	return en_panel_reports(inputs)
});
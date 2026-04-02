/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Kb_SummaryInputs */

const en_dashboard_kb_summary = /** @type {(inputs: Dashboard_Kb_SummaryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} recently updated`)
};

const es_dashboard_kb_summary = /** @type {(inputs: Dashboard_Kb_SummaryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} actualizados recientemente`)
};

/**
* | output |
* | --- |
* | "{count} recently updated" |
*
* @param {Dashboard_Kb_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_kb_summary = /** @type {((inputs: Dashboard_Kb_SummaryInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Kb_SummaryInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_kb_summary(inputs)
	return es_dashboard_kb_summary(inputs)
});
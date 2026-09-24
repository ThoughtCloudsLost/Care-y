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

const en_xa2_dashboard_kb_summary = /** @type {(inputs: Dashboard_Kb_SummaryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} rècèntly ùpdàtèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "{count} recently updated" |
*
* @param {Dashboard_Kb_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_kb_summary = /** @type {((inputs: Dashboard_Kb_SummaryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Kb_SummaryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_kb_summary(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_kb_summary(inputs)
	return en_dashboard_kb_summary(inputs)
});
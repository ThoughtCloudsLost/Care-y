/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Activity_SummaryInputs */

const en_dashboard_activity_summary = /** @type {(inputs: Dashboard_Activity_SummaryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} events in the last hour`)
};

const es_dashboard_activity_summary = /** @type {(inputs: Dashboard_Activity_SummaryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} eventos en la ultima hora`)
};

/**
* | output |
* | --- |
* | "{count} events in the last hour" |
*
* @param {Dashboard_Activity_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_summary = /** @type {((inputs: Dashboard_Activity_SummaryInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Activity_SummaryInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_activity_summary(inputs)
	return es_dashboard_activity_summary(inputs)
});
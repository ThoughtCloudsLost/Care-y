/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Activity_Summary_OneInputs */

const en_dashboard_activity_summary_one = /** @type {(inputs: Dashboard_Activity_Summary_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} event in the last hour`)
};

const es_dashboard_activity_summary_one = /** @type {(inputs: Dashboard_Activity_Summary_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} evento en la última hora`)
};

const en_xa2_dashboard_activity_summary_one = /** @type {(inputs: Dashboard_Activity_Summary_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} èvènt ìn thè làst hòùr •••••••⟧`)
};

/**
* | output |
* | --- |
* | "{count} event in the last hour" |
*
* @param {Dashboard_Activity_Summary_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_summary_one = /** @type {((inputs: Dashboard_Activity_Summary_OneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Activity_Summary_OneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_activity_summary_one(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_activity_summary_one(inputs)
	return en_dashboard_activity_summary_one(inputs)
});
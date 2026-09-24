/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Followup_CountInputs */

const en_dashboard_followup_count = /** @type {(inputs: Dashboard_Followup_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} follow-ups`)
};

const es_dashboard_followup_count = /** @type {(inputs: Dashboard_Followup_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} seguimientos`)
};

const en_xa2_dashboard_followup_count = /** @type {(inputs: Dashboard_Followup_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} fòllòw-ùps ••••⟧`)
};

/**
* | output |
* | --- |
* | "{count} follow-ups" |
*
* @param {Dashboard_Followup_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_followup_count = /** @type {((inputs: Dashboard_Followup_CountInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Followup_CountInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_followup_count(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_followup_count(inputs)
	return en_dashboard_followup_count(inputs)
});
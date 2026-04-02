/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Msgs_CountInputs */

const en_dashboard_msgs_count = /** @type {(inputs: Dashboard_Msgs_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} msgs`)
};

const es_dashboard_msgs_count = /** @type {(inputs: Dashboard_Msgs_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} msgs`)
};

/**
* | output |
* | --- |
* | "{count} msgs" |
*
* @param {Dashboard_Msgs_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_msgs_count = /** @type {((inputs: Dashboard_Msgs_CountInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Msgs_CountInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_msgs_count(inputs)
	return es_dashboard_msgs_count(inputs)
});
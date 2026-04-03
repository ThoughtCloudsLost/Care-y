/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Msg_CountInputs */

const en_dashboard_msg_count = /** @type {(inputs: Dashboard_Msg_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} msg`)
};

const es_dashboard_msg_count = /** @type {(inputs: Dashboard_Msg_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} msg`)
};

/**
* | output |
* | --- |
* | "{count} msg" |
*
* @param {Dashboard_Msg_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_msg_count = /** @type {((inputs: Dashboard_Msg_CountInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Msg_CountInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_msg_count(inputs)
	return es_dashboard_msg_count(inputs)
});
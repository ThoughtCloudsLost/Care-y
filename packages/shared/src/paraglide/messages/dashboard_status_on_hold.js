/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Status_On_HoldInputs */

const en_dashboard_status_on_hold = /** @type {(inputs: Dashboard_Status_On_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`On Hold`)
};

const es_dashboard_status_on_hold = /** @type {(inputs: Dashboard_Status_On_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`En espera`)
};

const en_xa2_dashboard_status_on_hold = /** @type {(inputs: Dashboard_Status_On_HoldInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òn Hòld •••⟧`)
};

/**
* | output |
* | --- |
* | "On Hold" |
*
* @param {Dashboard_Status_On_HoldInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_status_on_hold = /** @type {((inputs?: Dashboard_Status_On_HoldInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Status_On_HoldInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_status_on_hold(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_status_on_hold(inputs)
	return en_dashboard_status_on_hold(inputs)
});
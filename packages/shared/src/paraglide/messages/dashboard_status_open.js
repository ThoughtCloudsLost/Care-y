/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Status_OpenInputs */

const en_dashboard_status_open = /** @type {(inputs: Dashboard_Status_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open`)
};

const es_dashboard_status_open = /** @type {(inputs: Dashboard_Status_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abierto`)
};

const en_xa2_dashboard_status_open = /** @type {(inputs: Dashboard_Status_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn ••⟧`)
};

/**
* | output |
* | --- |
* | "Open" |
*
* @param {Dashboard_Status_OpenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_status_open = /** @type {((inputs?: Dashboard_Status_OpenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Status_OpenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_status_open(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_status_open(inputs)
	return en_dashboard_status_open(inputs)
});
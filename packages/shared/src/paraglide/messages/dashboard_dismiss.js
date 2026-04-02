/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_DismissInputs */

const en_dashboard_dismiss = /** @type {(inputs: Dashboard_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`OK`)
};

const es_dashboard_dismiss = /** @type {(inputs: Dashboard_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`OK`)
};

/**
* | output |
* | --- |
* | "OK" |
*
* @param {Dashboard_DismissInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_dismiss = /** @type {((inputs?: Dashboard_DismissInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_DismissInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_dismiss(inputs)
	return es_dashboard_dismiss(inputs)
});
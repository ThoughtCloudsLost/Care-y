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

const en_xa2_dashboard_dismiss = /** @type {(inputs: Dashboard_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦ÒK •⟧`)
};

/**
* | output |
* | --- |
* | "OK" |
*
* @param {Dashboard_DismissInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_dismiss = /** @type {((inputs?: Dashboard_DismissInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_DismissInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_dismiss(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_dismiss(inputs)
	return en_dashboard_dismiss(inputs)
});
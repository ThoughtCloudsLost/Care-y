/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Status_RoutedInputs */

const en_admin_quarantine_status_routed = /** @type {(inputs: Admin_Quarantine_Status_RoutedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Routed`)
};

const es_admin_quarantine_status_routed = /** @type {(inputs: Admin_Quarantine_Status_RoutedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enrutado`)
};

/**
* | output |
* | --- |
* | "Routed" |
*
* @param {Admin_Quarantine_Status_RoutedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_status_routed = /** @type {((inputs?: Admin_Quarantine_Status_RoutedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Status_RoutedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_status_routed(inputs)
	return es_admin_quarantine_status_routed(inputs)
});
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

const en_xa2_admin_quarantine_status_routed = /** @type {(inputs: Admin_Quarantine_Status_RoutedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ròùtèd ••⟧`)
};

/**
* | output |
* | --- |
* | "Routed" |
*
* @param {Admin_Quarantine_Status_RoutedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_status_routed = /** @type {((inputs?: Admin_Quarantine_Status_RoutedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Status_RoutedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_quarantine_status_routed(inputs)
	if (locale === "en-XA") return en_xa2_admin_quarantine_status_routed(inputs)
	return en_admin_quarantine_status_routed(inputs)
});
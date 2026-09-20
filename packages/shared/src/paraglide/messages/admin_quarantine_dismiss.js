/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_DismissInputs */

const en_admin_quarantine_dismiss = /** @type {(inputs: Admin_Quarantine_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dismiss`)
};

const es_admin_quarantine_dismiss = /** @type {(inputs: Admin_Quarantine_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descartar`)
};

const en_xa2_admin_quarantine_dismiss = /** @type {(inputs: Admin_Quarantine_DismissInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsmìss •••⟧`)
};

/**
* | output |
* | --- |
* | "Dismiss" |
*
* @param {Admin_Quarantine_DismissInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_dismiss = /** @type {((inputs?: Admin_Quarantine_DismissInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_DismissInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_quarantine_dismiss(inputs)
	if (locale === "en-XA") return en_xa2_admin_quarantine_dismiss(inputs)
	return en_admin_quarantine_dismiss(inputs)
});
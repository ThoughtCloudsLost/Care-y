/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_CalledInputs */

const en_admin_quarantine_called = /** @type {(inputs: Admin_Quarantine_CalledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Called`)
};

const es_admin_quarantine_called = /** @type {(inputs: Admin_Quarantine_CalledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamado`)
};

const en_xa2_admin_quarantine_called = /** @type {(inputs: Admin_Quarantine_CalledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càllèd ••⟧`)
};

/**
* | output |
* | --- |
* | "Called" |
*
* @param {Admin_Quarantine_CalledInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_called = /** @type {((inputs?: Admin_Quarantine_CalledInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_CalledInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_quarantine_called(inputs)
	if (locale === "en-XA") return en_xa2_admin_quarantine_called(inputs)
	return en_admin_quarantine_called(inputs)
});
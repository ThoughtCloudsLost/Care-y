/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_CallerInputs */

const en_admin_quarantine_caller = /** @type {(inputs: Admin_Quarantine_CallerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Caller`)
};

const es_admin_quarantine_caller = /** @type {(inputs: Admin_Quarantine_CallerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamante`)
};

/**
* | output |
* | --- |
* | "Caller" |
*
* @param {Admin_Quarantine_CallerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_caller = /** @type {((inputs?: Admin_Quarantine_CallerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_CallerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_caller(inputs)
	return es_admin_quarantine_caller(inputs)
});
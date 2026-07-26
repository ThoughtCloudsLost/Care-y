/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Quarantine_Dismiss_ConfirmInputs */

const en_admin_quarantine_dismiss_confirm = /** @type {(inputs: Admin_Quarantine_Dismiss_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This will permanently delete the recording. Are you sure?`)
};

const es_admin_quarantine_dismiss_confirm = /** @type {(inputs: Admin_Quarantine_Dismiss_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esto eliminara permanentemente la grabacion. Esta seguro?`)
};

/**
* | output |
* | --- |
* | "This will permanently delete the recording. Are you sure?" |
*
* @param {Admin_Quarantine_Dismiss_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_quarantine_dismiss_confirm = /** @type {((inputs?: Admin_Quarantine_Dismiss_ConfirmInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Quarantine_Dismiss_ConfirmInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_quarantine_dismiss_confirm(inputs)
	return es_admin_quarantine_dismiss_confirm(inputs)
});
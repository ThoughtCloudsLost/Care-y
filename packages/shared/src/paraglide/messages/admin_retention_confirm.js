/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_ConfirmInputs */

const en_admin_retention_confirm = /** @type {(inputs: Admin_Retention_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set retention`)
};

const es_admin_retention_confirm = /** @type {(inputs: Admin_Retention_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Establecer retención`)
};

const en_xa2_admin_retention_confirm = /** @type {(inputs: Admin_Retention_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèt rètèntìòn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Set retention" |
*
* @param {Admin_Retention_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_retention_confirm = /** @type {((inputs?: Admin_Retention_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_retention_confirm(inputs)
	if (locale === "en-XA") return en_xa2_admin_retention_confirm(inputs)
	return en_admin_retention_confirm(inputs)
});
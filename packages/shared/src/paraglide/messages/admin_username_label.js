/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Username_LabelInputs */

const en_admin_username_label = /** @type {(inputs: Admin_Username_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Login Username`)
};

const es_admin_username_label = /** @type {(inputs: Admin_Username_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario de inicio de sesión`)
};

const en_xa2_admin_username_label = /** @type {(inputs: Admin_Username_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lògìn Ùsèrnàmè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Login Username" |
*
* @param {Admin_Username_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_username_label = /** @type {((inputs?: Admin_Username_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Username_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_username_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_username_label(inputs)
	return en_admin_username_label(inputs)
});
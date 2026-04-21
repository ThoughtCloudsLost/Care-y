/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Username_LabelInputs */

const en_admin_username_label = /** @type {(inputs: Admin_Username_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Login Username`)
};

const es_admin_username_label = /** @type {(inputs: Admin_Username_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuario de inicio de sesion`)
};

/**
* | output |
* | --- |
* | "Login Username" |
*
* @param {Admin_Username_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_username_label = /** @type {((inputs?: Admin_Username_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Username_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_username_label(inputs)
	return es_admin_username_label(inputs)
});
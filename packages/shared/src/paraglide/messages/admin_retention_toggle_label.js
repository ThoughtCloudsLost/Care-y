/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_Toggle_LabelInputs */

const en_admin_retention_toggle_label = /** @type {(inputs: Admin_Retention_Toggle_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Automatic data deletion`)
};

const es_admin_retention_toggle_label = /** @type {(inputs: Admin_Retention_Toggle_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminacion automatica de datos`)
};

/**
* | output |
* | --- |
* | "Automatic data deletion" |
*
* @param {Admin_Retention_Toggle_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_toggle_label = /** @type {((inputs?: Admin_Retention_Toggle_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Toggle_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_retention_toggle_label(inputs)
	return es_admin_retention_toggle_label(inputs)
});
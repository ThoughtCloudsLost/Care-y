/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_Unsaved_HintInputs */

const en_admin_retention_unsaved_hint = /** @type {(inputs: Admin_Retention_Unsaved_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unsaved change`)
};

const es_admin_retention_unsaved_hint = /** @type {(inputs: Admin_Retention_Unsaved_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambio sin guardar`)
};

/**
* | output |
* | --- |
* | "Unsaved change" |
*
* @param {Admin_Retention_Unsaved_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_unsaved_hint = /** @type {((inputs?: Admin_Retention_Unsaved_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Unsaved_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_retention_unsaved_hint(inputs)
	return es_admin_retention_unsaved_hint(inputs)
});
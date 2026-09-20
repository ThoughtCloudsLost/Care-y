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

const en_xa2_admin_retention_unsaved_hint = /** @type {(inputs: Admin_Retention_Unsaved_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnsàvèd chàngè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Unsaved change" |
*
* @param {Admin_Retention_Unsaved_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_retention_unsaved_hint = /** @type {((inputs?: Admin_Retention_Unsaved_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Unsaved_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_retention_unsaved_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_retention_unsaved_hint(inputs)
	return en_admin_retention_unsaved_hint(inputs)
});
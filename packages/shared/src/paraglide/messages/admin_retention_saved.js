/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_SavedInputs */

const en_admin_retention_saved = /** @type {(inputs: Admin_Retention_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retention setting saved`)
};

const es_admin_retention_saved = /** @type {(inputs: Admin_Retention_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configuración de retención guardada`)
};

const en_xa2_admin_retention_saved = /** @type {(inputs: Admin_Retention_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rètèntìòn sèttìng sàvèd •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Retention setting saved" |
*
* @param {Admin_Retention_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_retention_saved = /** @type {((inputs?: Admin_Retention_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_retention_saved(inputs)
	if (locale === "en-XA") return en_xa2_admin_retention_saved(inputs)
	return en_admin_retention_saved(inputs)
});
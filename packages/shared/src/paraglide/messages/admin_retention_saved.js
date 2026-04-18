/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_SavedInputs */

const en_admin_retention_saved = /** @type {(inputs: Admin_Retention_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retention setting saved`)
};

const es_admin_retention_saved = /** @type {(inputs: Admin_Retention_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configuracion de retencion guardada`)
};

/**
* | output |
* | --- |
* | "Retention setting saved" |
*
* @param {Admin_Retention_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_saved = /** @type {((inputs?: Admin_Retention_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_retention_saved(inputs)
	return es_admin_retention_saved(inputs)
});
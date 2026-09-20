/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_DeletedInputs */

const en_admin_presets_deleted = /** @type {(inputs: Admin_Presets_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saved reply deleted.`)
};

const es_admin_presets_deleted = /** @type {(inputs: Admin_Presets_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuesta guardada eliminada.`)
};

const en_xa2_admin_presets_deleted = /** @type {(inputs: Admin_Presets_DeletedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvèd rèply dèlètèd. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Saved reply deleted." |
*
* @param {Admin_Presets_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_presets_deleted = /** @type {((inputs?: Admin_Presets_DeletedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_DeletedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_deleted(inputs)
	if (locale === "en-XA") return en_xa2_admin_presets_deleted(inputs)
	return en_admin_presets_deleted(inputs)
});
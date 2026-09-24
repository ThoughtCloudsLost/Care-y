/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Presets_CreatedInputs */

const en_admin_presets_created = /** @type {(inputs: Admin_Presets_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saved reply created.`)
};

const es_admin_presets_created = /** @type {(inputs: Admin_Presets_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuesta guardada creada.`)
};

const en_xa2_admin_presets_created = /** @type {(inputs: Admin_Presets_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvèd rèply crèàtèd. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Saved reply created." |
*
* @param {Admin_Presets_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_presets_created = /** @type {((inputs?: Admin_Presets_CreatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Presets_CreatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_presets_created(inputs)
	if (locale === "en-XA") return en_xa2_admin_presets_created(inputs)
	return en_admin_presets_created(inputs)
});
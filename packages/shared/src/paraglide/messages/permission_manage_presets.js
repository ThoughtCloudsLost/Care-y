/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_PresetsInputs */

const en_permission_manage_presets = /** @type {(inputs: Permission_Manage_PresetsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage presets`)
};

const es_permission_manage_presets = /** @type {(inputs: Permission_Manage_PresetsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gestionar plantillas`)
};

const en_xa2_permission_manage_presets = /** @type {(inputs: Permission_Manage_PresetsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mànàgè prèsèts •••••⟧`)
};

/**
* | output |
* | --- |
* | "Manage presets" |
*
* @param {Permission_Manage_PresetsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_presets = /** @type {((inputs?: Permission_Manage_PresetsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_PresetsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_presets(inputs)
	if (locale === "en-XA") return en_xa2_permission_manage_presets(inputs)
	return en_permission_manage_presets(inputs)
});
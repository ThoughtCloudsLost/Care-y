/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_PresetsInputs */

const en_permission_manage_presets = /** @type {(inputs: Permission_Manage_PresetsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage saved replies`)
};

const es_permission_manage_presets = /** @type {(inputs: Permission_Manage_PresetsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrar respuestas guardadas`)
};

/**
* | output |
* | --- |
* | "Manage saved replies" |
*
* @param {Permission_Manage_PresetsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_presets = /** @type {((inputs?: Permission_Manage_PresetsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_PresetsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_presets(inputs)
	return en_permission_manage_presets(inputs)
});
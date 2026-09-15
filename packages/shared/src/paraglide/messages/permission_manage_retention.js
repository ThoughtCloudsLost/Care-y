/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_RetentionInputs */

const en_permission_manage_retention = /** @type {(inputs: Permission_Manage_RetentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set how long personal information is kept`)
};

const es_permission_manage_retention = /** @type {(inputs: Permission_Manage_RetentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Definir cuanto tiempo se conservan los datos personales`)
};

/**
* | output |
* | --- |
* | "Set how long personal information is kept" |
*
* @param {Permission_Manage_RetentionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_retention = /** @type {((inputs?: Permission_Manage_RetentionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_RetentionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_retention(inputs)
	return en_permission_manage_retention(inputs)
});
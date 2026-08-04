/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Moderate_ContentInputs */

const en_permission_moderate_content = /** @type {(inputs: Permission_Moderate_ContentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Review content`)
};

const es_permission_moderate_content = /** @type {(inputs: Permission_Moderate_ContentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revisar contenido`)
};

/**
* | output |
* | --- |
* | "Review content" |
*
* @param {Permission_Moderate_ContentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_moderate_content = /** @type {((inputs?: Permission_Moderate_ContentInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Moderate_ContentInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_permission_moderate_content(inputs)
	return es_permission_moderate_content(inputs)
});
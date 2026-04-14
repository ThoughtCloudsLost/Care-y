/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nav_Create_NewInputs */

const en_nav_create_new = /** @type {(inputs: Nav_Create_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create new`)
};

const es_nav_create_new = /** @type {(inputs: Nav_Create_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear nuevo`)
};

/**
* | output |
* | --- |
* | "Create new" |
*
* @param {Nav_Create_NewInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_create_new = /** @type {((inputs?: Nav_Create_NewInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_Create_NewInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_nav_create_new(inputs)
	return es_nav_create_new(inputs)
});
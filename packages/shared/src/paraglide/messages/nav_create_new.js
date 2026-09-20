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

const en_xa2_nav_create_new = /** @type {(inputs: Nav_Create_NewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè nèw •••⟧`)
};

/**
* | output |
* | --- |
* | "Create new" |
*
* @param {Nav_Create_NewInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const nav_create_new = /** @type {((inputs?: Nav_Create_NewInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_Create_NewInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_nav_create_new(inputs)
	if (locale === "en-XA") return en_xa2_nav_create_new(inputs)
	return en_nav_create_new(inputs)
});
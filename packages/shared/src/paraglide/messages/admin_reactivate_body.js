/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Reactivate_BodyInputs */

const en_admin_reactivate_body = /** @type {(inputs: Admin_Reactivate_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Their account will be restored, but they will need a new organization key share before they can access encrypted data.`)
};

const es_admin_reactivate_body = /** @type {(inputs: Admin_Reactivate_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Su cuenta sera restaurada, pero necesitara una nueva copia de la clave de organizacion para acceder a los datos cifrados.`)
};

/**
* | output |
* | --- |
* | "Their account will be restored, but they will need a new organization key share before they can access encrypted data." |
*
* @param {Admin_Reactivate_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_reactivate_body = /** @type {((inputs?: Admin_Reactivate_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reactivate_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_reactivate_body(inputs)
	return es_admin_reactivate_body(inputs)
});
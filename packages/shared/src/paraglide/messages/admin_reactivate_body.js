/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Reactivate_BodyInputs */

const en_admin_reactivate_body = /** @type {(inputs: Admin_Reactivate_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Their account will be restored, but they will need a new organization key share before they can access encrypted data.`)
};

const es_admin_reactivate_body = /** @type {(inputs: Admin_Reactivate_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Su cuenta será restaurada, pero necesitará una nueva copia de la clave de organización para acceder a los datos cifrados.`)
};

const en_xa2_admin_reactivate_body = /** @type {(inputs: Admin_Reactivate_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thèìr àccòùnt wìll bè rèstòrèd, bùt thèy wìll nèèd à nèw òrgànìzàtìòn kèy shàrè bèfòrè thèy càn àccèss èncryptèd dàtà. ••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Their account will be restored, but they will need a new organization key share before they can access encrypted data." |
*
* @param {Admin_Reactivate_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_reactivate_body = /** @type {((inputs?: Admin_Reactivate_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Reactivate_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_reactivate_body(inputs)
	if (locale === "en-XA") return en_xa2_admin_reactivate_body(inputs)
	return en_admin_reactivate_body(inputs)
});
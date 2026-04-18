/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_Clear_BodyInputs */

const en_admin_retention_clear_body = /** @type {(inputs: Admin_Retention_Clear_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets, messages, and caller personal information will be kept indefinitely until manually deleted.`)
};

const es_admin_retention_clear_body = /** @type {(inputs: Admin_Retention_Clear_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los tickets, mensajes e informacion personal de los llamantes se conservaran indefinidamente hasta que se eliminen manualmente.`)
};

/**
* | output |
* | --- |
* | "Tickets, messages, and caller personal information will be kept indefinitely until manually deleted." |
*
* @param {Admin_Retention_Clear_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_clear_body = /** @type {((inputs?: Admin_Retention_Clear_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Clear_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_retention_clear_body(inputs)
	return es_admin_retention_clear_body(inputs)
});
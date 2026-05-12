/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Tickets: NonNullable<unknown>, tickets: NonNullable<unknown> }} Admin_Retention_Inactive_DescriptionInputs */

const en_admin_retention_inactive_description = /** @type {(inputs: Admin_Retention_Inactive_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Automatic deletion is off. ${i?.Tickets}, messages, and caller personal information are kept until manually deleted.`)
};

const es_admin_retention_inactive_description = /** @type {(inputs: Admin_Retention_Inactive_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`La eliminacion automatica esta desactivada. Los ${i?.tickets}, mensajes e informacion personal de los llamantes se conservan hasta que se eliminen manualmente.`)
};

/**
* | output |
* | --- |
* | "Automatic deletion is off. {Tickets}, messages, and caller personal information are kept until manually deleted." |
*
* @param {Admin_Retention_Inactive_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_inactive_description = /** @type {((inputs: Admin_Retention_Inactive_DescriptionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Inactive_DescriptionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_retention_inactive_description(inputs)
	return es_admin_retention_inactive_description(inputs)
});
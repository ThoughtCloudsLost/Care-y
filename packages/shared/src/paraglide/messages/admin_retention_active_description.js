/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Tickets: NonNullable<unknown>, days: NonNullable<unknown>, tickets: NonNullable<unknown> }} Admin_Retention_Active_DescriptionInputs */

const en_admin_retention_active_description = /** @type {(inputs: Admin_Retention_Active_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Tickets}, messages, and caller personal information older than ${i?.days} days are automatically deleted.`)
};

const es_admin_retention_active_description = /** @type {(inputs: Admin_Retention_Active_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Los ${i?.tickets}, mensajes e informacion personal de los llamantes con mas de ${i?.days} dias se eliminan automaticamente.`)
};

/**
* | output |
* | --- |
* | "{Tickets}, messages, and caller personal information older than {days} days are automatically deleted." |
*
* @param {Admin_Retention_Active_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_active_description = /** @type {((inputs: Admin_Retention_Active_DescriptionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Active_DescriptionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_retention_active_description(inputs)
	return es_admin_retention_active_description(inputs)
});
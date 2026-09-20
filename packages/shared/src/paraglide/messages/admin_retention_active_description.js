/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown>, days: NonNullable<unknown> }} Admin_Retention_Active_DescriptionInputs */

const en_admin_retention_active_description = /** @type {(inputs: Admin_Retention_Active_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Closed ${i?.tickets} and their data are deleted after ${i?.days} days without activity. People with open ${i?.tickets} are not affected.`)
};

const es_admin_retention_active_description = /** @type {(inputs: Admin_Retention_Active_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Los ${i?.tickets} cerrados y sus datos se eliminan después de ${i?.days} días sin actividad. Las personas con ${i?.tickets} abiertos no se ven afectadas.`)
};

/**
* | output |
* | --- |
* | "Closed {tickets} and their data are deleted after {days} days without activity. People with open {tickets} are not affected." |
*
* @param {Admin_Retention_Active_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_retention_active_description = /** @type {((inputs: Admin_Retention_Active_DescriptionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Active_DescriptionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_retention_active_description(inputs)
	return en_admin_retention_active_description(inputs)
});
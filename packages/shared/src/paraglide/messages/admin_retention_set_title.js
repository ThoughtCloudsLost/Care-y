/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ days: NonNullable<unknown> }} Admin_Retention_Set_TitleInputs */

const en_admin_retention_set_title = /** @type {(inputs: Admin_Retention_Set_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Set data retention to ${i?.days} days?`)
};

const es_admin_retention_set_title = /** @type {(inputs: Admin_Retention_Set_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`¿Establecer retención de datos en ${i?.days} días?`)
};

const en_xa2_admin_retention_set_title = /** @type {(inputs: Admin_Retention_Set_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Sèt dàtà rètèntìòn tò  •••••••${i?.days} dàys? ••⟧`)
};

/**
* | output |
* | --- |
* | "Set data retention to {days} days?" |
*
* @param {Admin_Retention_Set_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_retention_set_title = /** @type {((inputs: Admin_Retention_Set_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Set_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_retention_set_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_retention_set_title(inputs)
	return en_admin_retention_set_title(inputs)
});
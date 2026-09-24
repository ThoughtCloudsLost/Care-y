/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Retention_Clear_TitleInputs */

const en_admin_retention_clear_title = /** @type {(inputs: Admin_Retention_Clear_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disable automatic data deletion?`)
};

const es_admin_retention_clear_title = /** @type {(inputs: Admin_Retention_Clear_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Desactivar la eliminación automática de datos?`)
};

const en_xa2_admin_retention_clear_title = /** @type {(inputs: Admin_Retention_Clear_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsàblè àùtòmàtìc dàtà dèlètìòn? ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Disable automatic data deletion?" |
*
* @param {Admin_Retention_Clear_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_retention_clear_title = /** @type {((inputs?: Admin_Retention_Clear_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Retention_Clear_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_retention_clear_title(inputs)
	if (locale === "en-XA") return en_xa2_admin_retention_clear_title(inputs)
	return en_admin_retention_clear_title(inputs)
});
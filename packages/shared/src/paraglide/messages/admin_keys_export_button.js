/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Keys_Export_ButtonInputs */

const en_admin_keys_export_button = /** @type {(inputs: Admin_Keys_Export_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Export Escrow File`)
};

const es_admin_keys_export_button = /** @type {(inputs: Admin_Keys_Export_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Exportar archivo de custodia`)
};

const en_xa2_admin_keys_export_button = /** @type {(inputs: Admin_Keys_Export_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èxpòrt Èscròw Fìlè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Export Escrow File" |
*
* @param {Admin_Keys_Export_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_keys_export_button = /** @type {((inputs?: Admin_Keys_Export_ButtonInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Keys_Export_ButtonInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_keys_export_button(inputs)
	if (locale === "en-XA") return en_xa2_admin_keys_export_button(inputs)
	return en_admin_keys_export_button(inputs)
});
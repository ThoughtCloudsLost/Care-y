/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_TitleInputs */

const en_admin_escrow_title = /** @type {(inputs: Admin_Escrow_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Export Escrow File`)
};

const es_admin_escrow_title = /** @type {(inputs: Admin_Escrow_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Exportar archivo de custodia`)
};

/**
* | output |
* | --- |
* | "Export Escrow File" |
*
* @param {Admin_Escrow_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_title = /** @type {((inputs?: Admin_Escrow_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_title(inputs)
	return es_admin_escrow_title(inputs)
});
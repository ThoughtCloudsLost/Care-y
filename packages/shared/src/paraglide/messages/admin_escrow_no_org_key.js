/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_No_Org_KeyInputs */

const en_admin_escrow_no_org_key = /** @type {(inputs: Admin_Escrow_No_Org_KeyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization key not loaded. Log in again to export.`)
};

const es_admin_escrow_no_org_key = /** @type {(inputs: Admin_Escrow_No_Org_KeyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clave de la organizacion no cargada. Inicie sesion nuevamente para exportar.`)
};

/**
* | output |
* | --- |
* | "Organization key not loaded. Log in again to export." |
*
* @param {Admin_Escrow_No_Org_KeyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_no_org_key = /** @type {((inputs?: Admin_Escrow_No_Org_KeyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_No_Org_KeyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_no_org_key(inputs)
	return es_admin_escrow_no_org_key(inputs)
});
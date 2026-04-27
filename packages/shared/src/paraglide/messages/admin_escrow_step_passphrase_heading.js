/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Step_Passphrase_HeadingInputs */

const en_admin_escrow_step_passphrase_heading = /** @type {(inputs: Admin_Escrow_Step_Passphrase_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create a passphrase`)
};

const es_admin_escrow_step_passphrase_heading = /** @type {(inputs: Admin_Escrow_Step_Passphrase_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear una frase de contrasena`)
};

/**
* | output |
* | --- |
* | "Create a passphrase" |
*
* @param {Admin_Escrow_Step_Passphrase_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_step_passphrase_heading = /** @type {((inputs?: Admin_Escrow_Step_Passphrase_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Step_Passphrase_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_step_passphrase_heading(inputs)
	return es_admin_escrow_step_passphrase_heading(inputs)
});
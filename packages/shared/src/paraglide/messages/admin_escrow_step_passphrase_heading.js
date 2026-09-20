/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Step_Passphrase_HeadingInputs */

const en_admin_escrow_step_passphrase_heading = /** @type {(inputs: Admin_Escrow_Step_Passphrase_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create an escrow file passphrase`)
};

const es_admin_escrow_step_passphrase_heading = /** @type {(inputs: Admin_Escrow_Step_Passphrase_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear una frase de contraseña para el archivo de custodia`)
};

const en_xa2_admin_escrow_step_passphrase_heading = /** @type {(inputs: Admin_Escrow_Step_Passphrase_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè àn èscròw fìlè pàssphràsè ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Create an escrow file passphrase" |
*
* @param {Admin_Escrow_Step_Passphrase_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_step_passphrase_heading = /** @type {((inputs?: Admin_Escrow_Step_Passphrase_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Step_Passphrase_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_escrow_step_passphrase_heading(inputs)
	if (locale === "en-XA") return en_xa2_admin_escrow_step_passphrase_heading(inputs)
	return en_admin_escrow_step_passphrase_heading(inputs)
});
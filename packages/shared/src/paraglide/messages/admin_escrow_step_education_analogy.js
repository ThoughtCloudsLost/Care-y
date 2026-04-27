/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Step_Education_AnalogyInputs */

const en_admin_escrow_step_education_analogy = /** @type {(inputs: Admin_Escrow_Step_Education_AnalogyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Think of it as a master backup key, protected by a passphrase you choose.`)
};

const es_admin_escrow_step_education_analogy = /** @type {(inputs: Admin_Escrow_Step_Education_AnalogyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Piense en ello como una clave maestra de respaldo, protegida por una frase de contrasena que usted elija.`)
};

/**
* | output |
* | --- |
* | "Think of it as a master backup key, protected by a passphrase you choose." |
*
* @param {Admin_Escrow_Step_Education_AnalogyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_step_education_analogy = /** @type {((inputs?: Admin_Escrow_Step_Education_AnalogyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Step_Education_AnalogyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_step_education_analogy(inputs)
	return es_admin_escrow_step_education_analogy(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Escrow_Step_Education_ScopeInputs */

const en_admin_escrow_step_education_scope = /** @type {(inputs: Admin_Escrow_Step_Education_ScopeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Without it, your organization's knowledge base articles, volunteer names, queue names, and branding data cannot be recovered. Ticket conversations and client information use separate keys and are not covered by this file.`)
};

const es_admin_escrow_step_education_scope = /** @type {(inputs: Admin_Escrow_Step_Education_ScopeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin el, los articulos de la base de conocimientos, los nombres de voluntarios, los nombres de colas y los datos de marca de su organizacion no podran recuperarse. Las conversaciones de tickets y la informacion de clientes usan claves separadas y no estan cubiertas por este archivo.`)
};

/**
* | output |
* | --- |
* | "Without it, your organization's knowledge base articles, volunteer names, queue names, and branding data cannot be recovered. Ticket conversations and client..." |
*
* @param {Admin_Escrow_Step_Education_ScopeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_step_education_scope = /** @type {((inputs?: Admin_Escrow_Step_Education_ScopeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Step_Education_ScopeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_escrow_step_education_scope(inputs)
	return es_admin_escrow_step_education_scope(inputs)
});
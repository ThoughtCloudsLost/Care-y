/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Keys_ExplainerInputs */

const en_admin_keys_explainer = /** @type {(inputs: Admin_Keys_ExplainerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your organization key encrypts shared data: volunteer names, knowledge base articles, queue names, and branding. Ticket conversations and client information use separate per ticket keys.`)
};

const es_admin_keys_explainer = /** @type {(inputs: Admin_Keys_ExplainerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La clave de tu organizacion cifra los datos compartidos: nombres de voluntarios, articulos de la base de conocimiento, nombres de colas y marca. Las conversaciones de tickets y la informacion de clientes usan claves separadas por ticket.`)
};

/**
* | output |
* | --- |
* | "Your organization key encrypts shared data: volunteer names, knowledge base articles, queue names, and branding. Ticket conversations and client information ..." |
*
* @param {Admin_Keys_ExplainerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_keys_explainer = /** @type {((inputs?: Admin_Keys_ExplainerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Keys_ExplainerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_keys_explainer(inputs)
	return es_admin_keys_explainer(inputs)
});
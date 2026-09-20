/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ knowledgeBase: NonNullable<unknown>, volunteer: NonNullable<unknown>, queue: NonNullable<unknown>, Ticket: NonNullable<unknown>, client: NonNullable<unknown>, volunteers: NonNullable<unknown>, queues: NonNullable<unknown>, tickets: NonNullable<unknown>, clients: NonNullable<unknown> }} Admin_Escrow_Step_Education_ScopeInputs */

const en_admin_escrow_step_education_scope = /** @type {(inputs: Admin_Escrow_Step_Education_ScopeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Without it, your organization's ${i?.knowledgeBase} articles, ${i?.volunteer} names, ${i?.queue} names, and branding data cannot be recovered. ${i?.Ticket} conversations and ${i?.client} information use separate keys and are not covered by this file.`)
};

const es_admin_escrow_step_education_scope = /** @type {(inputs: Admin_Escrow_Step_Education_ScopeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Sin el, los artículos de la base de conocimientos, los nombres de ${i?.volunteers}, los nombres de ${i?.queues} y los datos de marca de su organización no podran recuperarse. Las conversaciones de ${i?.tickets} y la información de ${i?.clients} usan claves separadas y no estan cubiertas por este archivo.`)
};

const en_xa2_admin_escrow_step_education_scope = /** @type {(inputs: Admin_Escrow_Step_Education_ScopeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Wìthòùt ìt, yòùr òrgànìzàtìòn's  ••••••••••${i?.knowledgeBase} àrtìclès,  ••••${i?.volunteer} nàmès,  •••${i?.queue} nàmès, ànd bràndìng dàtà cànnòt bè rècòvèrèd.  •••••••••••••••${i?.Ticket} cònvèrsàtìòns ànd  ••••••${i?.client} ìnfòrmàtìòn ùsè sèpàràtè kèys ànd àrè nòt còvèrèd by thìs fìlè. ••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Without it, your organization's {knowledgeBase} articles, {volunteer} names, {queue} names, and branding data cannot be recovered. {Ticket} conversations and..." |
*
* @param {Admin_Escrow_Step_Education_ScopeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_step_education_scope = /** @type {((inputs: Admin_Escrow_Step_Education_ScopeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Escrow_Step_Education_ScopeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_escrow_step_education_scope(inputs)
	if (locale === "en-XA") return en_xa2_admin_escrow_step_education_scope(inputs)
	return en_admin_escrow_step_education_scope(inputs)
});
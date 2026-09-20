/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_Desc_QueueInputs */

const en_admin_terminology_desc_queue = /** @type {(inputs: Admin_Terminology_Desc_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How work items are organized and routed to team members.`)
};

const es_admin_terminology_desc_queue = /** @type {(inputs: Admin_Terminology_Desc_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cómo se organizan y asignan los elementos de trabajo a los miembros del equipo.`)
};

const en_xa2_admin_terminology_desc_queue = /** @type {(inputs: Admin_Terminology_Desc_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hòw wòrk ìtèms àrè òrgànìzèd ànd ròùtèd tò tèàm mèmbèrs. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "How work items are organized and routed to team members." |
*
* @param {Admin_Terminology_Desc_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_desc_queue = /** @type {((inputs?: Admin_Terminology_Desc_QueueInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Desc_QueueInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_terminology_desc_queue(inputs)
	if (locale === "en-XA") return en_xa2_admin_terminology_desc_queue(inputs)
	return en_admin_terminology_desc_queue(inputs)
});
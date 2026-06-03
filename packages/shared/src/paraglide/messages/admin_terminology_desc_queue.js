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

/**
* | output |
* | --- |
* | "How work items are organized and routed to team members." |
*
* @param {Admin_Terminology_Desc_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_desc_queue = /** @type {((inputs?: Admin_Terminology_Desc_QueueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Desc_QueueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_desc_queue(inputs)
	return es_admin_terminology_desc_queue(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Terminology_Group_QueueInputs */

const en_admin_terminology_group_queue = /** @type {(inputs: Admin_Terminology_Group_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Work group`)
};

const es_admin_terminology_group_queue = /** @type {(inputs: Admin_Terminology_Group_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Grupo de trabajo`)
};

/**
* | output |
* | --- |
* | "Work group" |
*
* @param {Admin_Terminology_Group_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_group_queue = /** @type {((inputs?: Admin_Terminology_Group_QueueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Terminology_Group_QueueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_terminology_group_queue(inputs)
	return es_admin_terminology_group_queue(inputs)
});
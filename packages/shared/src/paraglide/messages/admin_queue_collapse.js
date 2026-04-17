/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Queue_CollapseInputs */

const en_admin_queue_collapse = /** @type {(inputs: Admin_Queue_CollapseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hide members`)
};

const es_admin_queue_collapse = /** @type {(inputs: Admin_Queue_CollapseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ocultar miembros`)
};

/**
* | output |
* | --- |
* | "Hide members" |
*
* @param {Admin_Queue_CollapseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_queue_collapse = /** @type {((inputs?: Admin_Queue_CollapseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_CollapseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_queue_collapse(inputs)
	return es_admin_queue_collapse(inputs)
});
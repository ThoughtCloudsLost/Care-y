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

const en_xa2_admin_queue_collapse = /** @type {(inputs: Admin_Queue_CollapseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hìdè mèmbèrs ••••⟧`)
};

/**
* | output |
* | --- |
* | "Hide members" |
*
* @param {Admin_Queue_CollapseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_queue_collapse = /** @type {((inputs?: Admin_Queue_CollapseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Queue_CollapseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_queue_collapse(inputs)
	if (locale === "en-XA") return en_xa2_admin_queue_collapse(inputs)
	return en_admin_queue_collapse(inputs)
});
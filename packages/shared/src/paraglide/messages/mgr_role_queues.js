/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mgr_Role_QueuesInputs */

const en_mgr_role_queues = /** @type {(inputs: Mgr_Role_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`See all queues, not just your assignments`)
};

const es_mgr_role_queues = /** @type {(inputs: Mgr_Role_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver todas las colas, no solo las asignadas`)
};

/**
* | output |
* | --- |
* | "See all queues, not just your assignments" |
*
* @param {Mgr_Role_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_role_queues = /** @type {((inputs?: Mgr_Role_QueuesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Role_QueuesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mgr_role_queues(inputs)
	return es_mgr_role_queues(inputs)
});
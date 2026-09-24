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

const en_xa2_mgr_role_queues = /** @type {(inputs: Mgr_Role_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèè àll qùèùès, nòt jùst yòùr àssìgnmènts •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "See all queues, not just your assignments" |
*
* @param {Mgr_Role_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const mgr_role_queues = /** @type {((inputs?: Mgr_Role_QueuesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Role_QueuesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_mgr_role_queues(inputs)
	if (locale === "en-XA") return en_xa2_mgr_role_queues(inputs)
	return en_mgr_role_queues(inputs)
});
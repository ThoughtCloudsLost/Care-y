/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_QueuesInputs */

const en_permission_manage_queues = /** @type {(inputs: Permission_Manage_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage queues`)
};

const es_permission_manage_queues = /** @type {(inputs: Permission_Manage_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrar colas`)
};

/**
* | output |
* | --- |
* | "Manage queues" |
*
* @param {Permission_Manage_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_queues = /** @type {((inputs?: Permission_Manage_QueuesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_QueuesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_permission_manage_queues(inputs)
	return es_permission_manage_queues(inputs)
});
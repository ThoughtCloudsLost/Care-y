/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Group_QueuesInputs */

const en_roles_group_queues = /** @type {(inputs: Roles_Group_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queues`)
};

const es_roles_group_queues = /** @type {(inputs: Roles_Group_QueuesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Colas`)
};

/**
* | output |
* | --- |
* | "Queues" |
*
* @param {Roles_Group_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_queues = /** @type {((inputs?: Roles_Group_QueuesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Group_QueuesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_roles_group_queues(inputs)
	return en_roles_group_queues(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Manager: NonNullable<unknown> }} Role_ManagerInputs */

const en_role_manager = /** @type {(inputs: Role_ManagerInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Manager}`)
};

const es_role_manager = /** @type {(inputs: Role_ManagerInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Manager}`)
};

/**
* | output |
* | --- |
* | "{Manager}" |
*
* @param {Role_ManagerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const role_manager = /** @type {((inputs: Role_ManagerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Role_ManagerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_role_manager(inputs)
	return es_role_manager(inputs)
});
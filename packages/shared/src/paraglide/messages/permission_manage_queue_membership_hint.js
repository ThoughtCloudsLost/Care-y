/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Permission_Manage_Queue_Membership_HintInputs */

const en_permission_manage_queue_membership_hint = /** @type {(inputs: Permission_Manage_Queue_Membership_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Adding someone to a queue grants them read access to every case in that queue. Removing them revokes that access.`)
};

const es_permission_manage_queue_membership_hint = /** @type {(inputs: Permission_Manage_Queue_Membership_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar a alguien a una cola le otorga acceso de lectura a todos los casos de esa cola. Quitarlo revoca ese acceso.`)
};

/**
* | output |
* | --- |
* | "Adding someone to a queue grants them read access to every case in that queue. Removing them revokes that access." |
*
* @param {Permission_Manage_Queue_Membership_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_queue_membership_hint = /** @type {((inputs?: Permission_Manage_Queue_Membership_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Permission_Manage_Queue_Membership_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_permission_manage_queue_membership_hint(inputs)
	return en_permission_manage_queue_membership_hint(inputs)
});
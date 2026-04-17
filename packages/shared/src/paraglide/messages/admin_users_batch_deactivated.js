/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Users_Batch_DeactivatedInputs */

const en_admin_users_batch_deactivated = /** @type {(inputs: Admin_Users_Batch_DeactivatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} deactivated`)
};

const es_admin_users_batch_deactivated = /** @type {(inputs: Admin_Users_Batch_DeactivatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} desactivados`)
};

/**
* | output |
* | --- |
* | "{count} deactivated" |
*
* @param {Admin_Users_Batch_DeactivatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_batch_deactivated = /** @type {((inputs: Admin_Users_Batch_DeactivatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Batch_DeactivatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_users_batch_deactivated(inputs)
	return es_admin_users_batch_deactivated(inputs)
});
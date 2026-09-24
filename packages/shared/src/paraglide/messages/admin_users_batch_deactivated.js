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

const en_xa2_admin_users_batch_deactivated = /** @type {(inputs: Admin_Users_Batch_DeactivatedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} dèàctìvàtèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "{count} deactivated" |
*
* @param {Admin_Users_Batch_DeactivatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_users_batch_deactivated = /** @type {((inputs: Admin_Users_Batch_DeactivatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Users_Batch_DeactivatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_users_batch_deactivated(inputs)
	if (locale === "en-XA") return en_xa2_admin_users_batch_deactivated(inputs)
	return en_admin_users_batch_deactivated(inputs)
});
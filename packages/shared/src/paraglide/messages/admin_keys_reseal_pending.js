/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Admin_Keys_Reseal_PendingInputs */

const en_admin_keys_reseal_pending = /** @type {(inputs: Admin_Keys_Reseal_PendingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} records pending re-encryption.`)
};

const es_admin_keys_reseal_pending = /** @type {(inputs: Admin_Keys_Reseal_PendingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} registros pendientes de recifrado.`)
};

const en_xa2_admin_keys_reseal_pending = /** @type {(inputs: Admin_Keys_Reseal_PendingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} rècòrds pèndìng rè-èncryptìòn. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "{count} records pending re-encryption." |
*
* @param {Admin_Keys_Reseal_PendingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_keys_reseal_pending = /** @type {((inputs: Admin_Keys_Reseal_PendingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Keys_Reseal_PendingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_keys_reseal_pending(inputs)
	if (locale === "en-XA") return en_xa2_admin_keys_reseal_pending(inputs)
	return en_admin_keys_reseal_pending(inputs)
});
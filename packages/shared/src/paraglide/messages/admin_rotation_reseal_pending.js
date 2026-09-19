/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Rotation_Reseal_PendingInputs */

const en_admin_rotation_reseal_pending = /** @type {(inputs: Admin_Rotation_Reseal_PendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Some records are still waiting to be re-encrypted. This finishes automatically the next time you sign in.`)
};

const es_admin_rotation_reseal_pending = /** @type {(inputs: Admin_Rotation_Reseal_PendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Algunos registros aún están pendientes de volver a cifrarse. Esto se completará automáticamente la próxima vez que inicies sesión.`)
};

/**
* | output |
* | --- |
* | "Some records are still waiting to be re-encrypted. This finishes automatically the next time you sign in." |
*
* @param {Admin_Rotation_Reseal_PendingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_reseal_pending = /** @type {((inputs?: Admin_Rotation_Reseal_PendingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_Reseal_PendingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_rotation_reseal_pending(inputs)
	return en_admin_rotation_reseal_pending(inputs)
});
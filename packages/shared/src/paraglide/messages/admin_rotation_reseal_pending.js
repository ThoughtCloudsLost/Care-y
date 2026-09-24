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

const en_xa2_admin_rotation_reseal_pending = /** @type {(inputs: Admin_Rotation_Reseal_PendingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sòmè rècòrds àrè stìll wàìtìng tò bè rè-èncryptèd. Thìs fìnìshès àùtòmàtìcàlly thè nèxt tìmè yòù sìgn ìn. ••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Some records are still waiting to be re-encrypted. This finishes automatically the next time you sign in." |
*
* @param {Admin_Rotation_Reseal_PendingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_reseal_pending = /** @type {((inputs?: Admin_Rotation_Reseal_PendingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_Reseal_PendingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_rotation_reseal_pending(inputs)
	if (locale === "en-XA") return en_xa2_admin_rotation_reseal_pending(inputs)
	return en_admin_rotation_reseal_pending(inputs)
});
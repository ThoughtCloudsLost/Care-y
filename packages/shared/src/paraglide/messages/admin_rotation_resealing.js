/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ done: NonNullable<unknown>, total: NonNullable<unknown> }} Admin_Rotation_ResealingInputs */

const en_admin_rotation_resealing = /** @type {(inputs: Admin_Rotation_ResealingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Securing records: ${i?.done} of ${i?.total}...`)
};

const es_admin_rotation_resealing = /** @type {(inputs: Admin_Rotation_ResealingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Protegiendo registros: ${i?.done} de ${i?.total}...`)
};

const en_xa2_admin_rotation_resealing = /** @type {(inputs: Admin_Rotation_ResealingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Sècùrìng rècòrds:  ••••••${i?.done} òf  ••${i?.total}... •⟧`)
};

/**
* | output |
* | --- |
* | "Securing records: {done} of {total}..." |
*
* @param {Admin_Rotation_ResealingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_resealing = /** @type {((inputs: Admin_Rotation_ResealingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Rotation_ResealingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_rotation_resealing(inputs)
	if (locale === "en-XA") return en_xa2_admin_rotation_resealing(inputs)
	return en_admin_rotation_resealing(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Library_Delete_Confirm_BodyInputs */

const en_library_delete_confirm_body = /** @type {(inputs: Library_Delete_Confirm_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Delete ${i?.count} articles? This cannot be undone.`)
};

const es_library_delete_confirm_body = /** @type {(inputs: Library_Delete_Confirm_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`¿Eliminar ${i?.count} artículos? Esto no se puede deshacer.`)
};

const en_xa2_library_delete_confirm_body = /** @type {(inputs: Library_Delete_Confirm_BodyInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè  •••${i?.count} àrtìclès? Thìs cànnòt bè ùndònè. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Delete {count} articles? This cannot be undone." |
*
* @param {Library_Delete_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_delete_confirm_body = /** @type {((inputs: Library_Delete_Confirm_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Delete_Confirm_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_delete_confirm_body(inputs)
	if (locale === "en-XA") return en_xa2_library_delete_confirm_body(inputs)
	return en_library_delete_confirm_body(inputs)
});
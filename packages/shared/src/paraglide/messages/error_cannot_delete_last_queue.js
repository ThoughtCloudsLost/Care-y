/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown> }} Error_Cannot_Delete_Last_QueueInputs */

const en_error_cannot_delete_last_queue = /** @type {(inputs: Error_Cannot_Delete_Last_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cannot delete the last ${i?.queue}.`)
};

const es_error_cannot_delete_last_queue = /** @type {(inputs: Error_Cannot_Delete_Last_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No se puede eliminar la última ${i?.queue}.`)
};

const en_xa2_error_cannot_delete_last_queue = /** @type {(inputs: Error_Cannot_Delete_Last_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Cànnòt dèlètè thè làst  •••••••${i?.queue}. •⟧`)
};

/**
* | output |
* | --- |
* | "Cannot delete the last {queue}." |
*
* @param {Error_Cannot_Delete_Last_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_cannot_delete_last_queue = /** @type {((inputs: Error_Cannot_Delete_Last_QueueInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Cannot_Delete_Last_QueueInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_cannot_delete_last_queue(inputs)
	if (locale === "en-XA") return en_xa2_error_cannot_delete_last_queue(inputs)
	return en_error_cannot_delete_last_queue(inputs)
});
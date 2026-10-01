/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Deletion_Not_CancellableInputs */

const en_error_deletion_not_cancellable = /** @type {(inputs: Error_Deletion_Not_CancellableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This deletion request can no longer be cancelled.`)
};

const es_error_deletion_not_cancellable = /** @type {(inputs: Error_Deletion_Not_CancellableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta solicitud de eliminación ya no se puede cancelar.`)
};

const en_xa2_error_deletion_not_cancellable = /** @type {(inputs: Error_Deletion_Not_CancellableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs dèlètìòn rèqùèst càn nò lòngèr bè càncèllèd. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This deletion request can no longer be cancelled." |
*
* @param {Error_Deletion_Not_CancellableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_deletion_not_cancellable = /** @type {((inputs?: Error_Deletion_Not_CancellableInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Deletion_Not_CancellableInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_deletion_not_cancellable(inputs)
	if (locale === "en-XA") return en_xa2_error_deletion_not_cancellable(inputs)
	return en_error_deletion_not_cancellable(inputs)
});
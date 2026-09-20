/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Sole_Wrap_HolderInputs */

const en_error_sole_wrap_holder = /** @type {(inputs: Error_Sole_Wrap_HolderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This user is the sole key holder for one or more tickets. Deactivating would permanently destroy access to that data.`)
};

const es_error_sole_wrap_holder = /** @type {(inputs: Error_Sole_Wrap_HolderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este usuario es el único poseedor de la clave de uno o más casos. Desactivar destruiría permanentemente el acceso a esos datos.`)
};

/**
* | output |
* | --- |
* | "This user is the sole key holder for one or more tickets. Deactivating would permanently destroy access to that data." |
*
* @param {Error_Sole_Wrap_HolderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_sole_wrap_holder = /** @type {((inputs?: Error_Sole_Wrap_HolderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Sole_Wrap_HolderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_sole_wrap_holder(inputs)
	return en_error_sole_wrap_holder(inputs)
});
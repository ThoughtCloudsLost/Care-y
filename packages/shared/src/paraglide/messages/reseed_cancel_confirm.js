/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Reseed_Cancel_ConfirmInputs */

const en_reseed_cancel_confirm = /** @type {(inputs: Reseed_Cancel_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Stopping now keeps what was already recovered. You can finish the rest by generating a new link later.`)
};

const es_reseed_cancel_confirm = /** @type {(inputs: Reseed_Cancel_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Detener ahora conserva lo que ya se recuperó. Puedes terminar el resto generando un nuevo enlace después.`)
};

/**
* | output |
* | --- |
* | "Stopping now keeps what was already recovered. You can finish the rest by generating a new link later." |
*
* @param {Reseed_Cancel_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const reseed_cancel_confirm = /** @type {((inputs?: Reseed_Cancel_ConfirmInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Reseed_Cancel_ConfirmInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_reseed_cancel_confirm(inputs)
	return en_reseed_cancel_confirm(inputs)
});
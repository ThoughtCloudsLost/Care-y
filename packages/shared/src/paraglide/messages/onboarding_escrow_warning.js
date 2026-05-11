/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_WarningInputs */

const en_onboarding_escrow_warning = /** @type {(inputs: Onboarding_Escrow_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Store this file on an encrypted USB drive in a physically secure location. For production deployments, follow the full escrow ceremony in the operations manual.`)
};

const es_onboarding_escrow_warning = /** @type {(inputs: Onboarding_Escrow_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Almacene este archivo en una unidad USB cifrada en un lugar fisicamente seguro. Para despliegues en produccion, siga la ceremonia completa de custodia en el manual de operaciones.`)
};

/**
* | output |
* | --- |
* | "Store this file on an encrypted USB drive in a physically secure location. For production deployments, follow the full escrow ceremony in the operations manual." |
*
* @param {Onboarding_Escrow_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_warning = /** @type {((inputs?: Onboarding_Escrow_WarningInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_WarningInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_warning(inputs)
	return es_onboarding_escrow_warning(inputs)
});
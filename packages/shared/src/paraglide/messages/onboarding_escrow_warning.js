/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_WarningInputs */

const en_onboarding_escrow_warning = /** @type {(inputs: Onboarding_Escrow_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This file is your emergency recovery key. If every admin loses access to their account, this is the only way to recover your organization's data. Store it somewhere safe and offline, like an encrypted USB drive kept in a locked drawer.`)
};

const es_onboarding_escrow_warning = /** @type {(inputs: Onboarding_Escrow_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este archivo es tu clave de recuperacion de emergencia. Si todos los administradores pierden acceso a sus cuentas, esta es la unica forma de recuperar los datos de tu organizacion. Guardalo en un lugar seguro y sin conexion, como una unidad USB cifrada en un cajon con llave.`)
};

/**
* | output |
* | --- |
* | "This file is your emergency recovery key. If every admin loses access to their account, this is the only way to recover your organization's data. Store it so..." |
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
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Retention_DisclosureInputs */

const en_intake_retention_disclosure = /** @type {(inputs: Intake_Retention_DisclosureInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When you call or text this hotline, your phone number is used to connect the call or deliver the message. The hotline system encrypts your information immediately, but the phone service provider keeps a record of your phone number for up to 150 days. This is required by the provider's policies and cannot be changed by the hotline. Your messages are kept by the provider for up to 60 days. The hotline operator is evaluating alternatives that eliminate this third-party retention.`)
};

const es_intake_retention_disclosure = /** @type {(inputs: Intake_Retention_DisclosureInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando llamas o envias un mensaje de texto a esta linea de ayuda, tu numero de telefono se usa para conectar la llamada o entregar el mensaje. El sistema de la linea cifra tu informacion de inmediato, pero el proveedor de servicio telefonico conserva un registro de tu numero de telefono por hasta 150 dias. Esto es requerido por las politicas del proveedor y la linea de ayuda no puede cambiarlo. Tus mensajes son conservados por el proveedor por hasta 60 dias. El operador de la linea esta evaluando alternativas que eliminen esta retencion por parte de terceros.`)
};

/**
* | output |
* | --- |
* | "When you call or text this hotline, your phone number is used to connect the call or deliver the message. The hotline system encrypts your information immedi..." |
*
* @param {Intake_Retention_DisclosureInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_retention_disclosure = /** @type {((inputs?: Intake_Retention_DisclosureInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Retention_DisclosureInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_retention_disclosure(inputs)
	return es_intake_retention_disclosure(inputs)
});
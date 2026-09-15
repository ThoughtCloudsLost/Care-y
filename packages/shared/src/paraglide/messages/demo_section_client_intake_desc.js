/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Client_Intake_DescInputs */

const en_demo_section_client_intake_desc = /** @type {(inputs: Demo_Section_Client_Intake_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The intake form is the public entry point for people seeking help. Every organization has a built-in default form, and administrators can publish custom forms that replace it with their own fields, and everything the visitor types is encrypted in the browser before it leaves the device.`)
};

const es_demo_section_client_intake_desc = /** @type {(inputs: Demo_Section_Client_Intake_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El formulario de admisión es el punto de entrada público para las personas que buscan ayuda. Toda organización tiene un formulario predeterminado, y los administradores pueden publicar formularios personalizados que lo reemplacen con sus propios campos, y todo lo que el visitante escribe se cifra en el navegador antes de salir del dispositivo.`)
};

/**
* | output |
* | --- |
* | "The intake form is the public entry point for people seeking help. Every organization has a built-in default form, and administrators can publish custom form..." |
*
* @param {Demo_Section_Client_Intake_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_intake_desc = /** @type {((inputs?: Demo_Section_Client_Intake_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Client_Intake_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_client_intake_desc(inputs)
	return en_demo_section_client_intake_desc(inputs)
});
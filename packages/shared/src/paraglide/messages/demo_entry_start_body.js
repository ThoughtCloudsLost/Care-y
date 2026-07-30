/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Start_BodyInputs */

const en_demo_entry_start_body = /** @type {(inputs: Demo_Entry_Start_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The demo begins at the login screen, where CARE-Y derives the encryption keys that protect everything else. Everything you see is fictional: the volunteers, the clients, and every ticket are invented for this walkthrough. You can restart at any point to come back to this page.`)
};

const es_demo_entry_start_body = /** @type {(inputs: Demo_Entry_Start_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La demostracion empieza en la pantalla de inicio de sesion, donde CARE-Y deriva las claves de cifrado que protegen todo lo demas. Todo lo que ves es ficticio: las personas voluntarias, los clientes y cada caso estan inventados para este recorrido. Puedes reiniciar en cualquier momento para volver a esta pagina.`)
};

/**
* | output |
* | --- |
* | "The demo begins at the login screen, where CARE-Y derives the encryption keys that protect everything else. Everything you see is fictional: the volunteers, ..." |
*
* @param {Demo_Entry_Start_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_start_body = /** @type {((inputs?: Demo_Entry_Start_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Start_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_entry_start_body(inputs)
	return es_demo_entry_start_body(inputs)
});
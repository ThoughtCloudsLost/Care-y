/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_How_BodyInputs */

const en_demo_entry_how_body = /** @type {(inputs: Demo_Entry_How_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The phone on this page runs the actual CARE-Y client against a database that lives inside your browser. Nothing is sent to a server and nothing you type here leaves your device. The text you are reading follows along: pick a feature and the phone opens that screen, or move around in the phone and the story follows you. Each topic gets its own page, so you can read straight through or jump to whatever interests you.`)
};

const es_demo_entry_how_body = /** @type {(inputs: Demo_Entry_How_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El telefono de esta pagina ejecuta el cliente real de CARE-Y sobre una base de datos que vive dentro de tu navegador. No se envia nada a ningun servidor y nada de lo que escribas aqui sale de tu dispositivo. El texto que estas leyendo va en paralelo: elige una funcion y el telefono abre esa pantalla, o navega por el telefono y el relato te sigue. Cada tema tiene su propia pagina, asi que puedes leerlo todo seguido o saltar a lo que te interese.`)
};

/**
* | output |
* | --- |
* | "The phone on this page runs the actual CARE-Y client against a database that lives inside your browser. Nothing is sent to a server and nothing you type here..." |
*
* @param {Demo_Entry_How_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_how_body = /** @type {((inputs?: Demo_Entry_How_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_How_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_entry_how_body(inputs)
	return es_demo_entry_how_body(inputs)
});
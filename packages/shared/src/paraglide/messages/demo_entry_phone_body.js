/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Phone_BodyInputs */

const en_demo_entry_phone_body = /** @type {(inputs: Demo_Entry_Phone_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Drag the phone by the grip above it, resize it from any edge, or use the toolbar buttons to shrink it, restore it, or switch to a desktop shaped window. The text reflows around wherever you put it. The link button breaks the connection between the phone and the story if you would rather explore one without moving the other.`)
};

const es_demo_entry_phone_body = /** @type {(inputs: Demo_Entry_Phone_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Arrastra el telefono desde el asa superior, cambia su tamano desde cualquier borde o usa los botones de la barra para reducirlo, restaurarlo o pasar a una ventana con forma de escritorio. El texto se recoloca alrededor de donde lo dejes. El boton de enlace corta la conexion entre el telefono y el relato si prefieres explorar uno sin mover el otro.`)
};

/**
* | output |
* | --- |
* | "Drag the phone by the grip above it, resize it from any edge, or use the toolbar buttons to shrink it, restore it, or switch to a desktop shaped window. The ..." |
*
* @param {Demo_Entry_Phone_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_phone_body = /** @type {((inputs?: Demo_Entry_Phone_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Phone_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_entry_phone_body(inputs)
	return es_demo_entry_phone_body(inputs)
});
/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Branding_BodyInputs */

const en_demo_narrative_admin_branding_body = /** @type {(inputs: Demo_Narrative_Admin_Branding_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The organization's logo, two brand colors, and the text shown to the visitor on the portal are stored as plaintext on the server so pages visited before signing in can display them without decryption.
**What the server holds.** When a logo is uploaded, every file format is rasterized to PNG in the browser before it leaves the device, and the rasterized result is what the server receives. After saving, separate icons are generated for the PWA manifest and home screen, and a failure in that step raises its own notice without undoing the branding save.
**Contrast.** The branding editor checks each brand color against WCAG AA contrast requirements and adjusts it at runtime when needed, in both light and dark mode. A color that sits too close to the care or urgent semantic hues draws a notice offering a nudged value, though saving with the original is always allowed.
**Permissions.** Editing branding requires the Manage organization identity permission.`)
};

const es_demo_narrative_admin_branding_body = /** @type {(inputs: Demo_Narrative_Admin_Branding_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El logotipo de la organización, los dos colores de marca y el texto que se muestra al visitante en el portal se almacenan en texto plano en el servidor para que las páginas visitadas antes de iniciar sesión puedan mostrarlos sin descifrado.
**Lo que almacena el servidor.** Cuando se sube un logotipo, cualquier formato de archivo se rasteriza a PNG en el navegador antes de salir del dispositivo, y el resultado rasterizado es lo que recibe el servidor. Después de guardar se generan iconos separados para el manifiesto PWA y la pantalla de inicio, y un fallo en ese paso muestra su propio aviso sin deshacer el guardado de la marca.
**Contraste.** El editor de marca comprueba cada color de marca contra los requisitos de contraste WCAG AA y lo ajusta en tiempo de ejecución cuando es necesario, tanto en modo claro como oscuro. Un color demasiado cercano a los tonos semánticos de urgencia o cuidado muestra un aviso ofreciendo un valor ajustado, aunque guardar con el original siempre está permitido.
**Permisos.** Editar la marca requiere el permiso Cambiar como se presenta la organización.`)
};

/**
* | output |
* | --- |
* | "The organization's logo, two brand colors, and the text shown to the visitor on the portal are stored as plaintext on the server so pages visited before sign..." |
*
* @param {Demo_Narrative_Admin_Branding_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_branding_body = /** @type {((inputs?: Demo_Narrative_Admin_Branding_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Branding_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_branding_body(inputs)
	return en_demo_narrative_admin_branding_body(inputs)
});
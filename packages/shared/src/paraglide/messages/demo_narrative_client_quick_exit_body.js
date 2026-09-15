/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Quick_Exit_BodyInputs */

const en_demo_narrative_client_quick_exit_body = /** @type {(inputs: Demo_Narrative_Client_Quick_Exit_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The quick exit control appears on every client page, from the intake form through the portal and account to share links. It is an icon with no visible text label, because the word "exit" on screen could draw attention on a shared or monitored device.
**How it works.** Tapping the control or pressing Escape anywhere on the page runs a fixed sequence. The browser tab's title is blanked so the tab strip does not show the organization's name, all encryption keys held in memory are zeroed, and the browser navigates to a neutral site the organization configures in its settings. The navigation replaces the current history entry so the client page does not appear behind the back button. Escape takes precedence over closing any open panel or sheet, because leaving fast is the purpose of the control and the navigation tears the page down either way. On the account page, quick exit also ends the server side session so the cookie cannot be reused.
**Safety net.** Quick exit zeroes keys automatically when a tab is closed or the visitor navigates away before using the control. On the account page a 15 minute idle timer that warns at the ten minute mark returns to the sign in form.
**Security tradeoff.** The account page's session cookie has a 24 hour expiry. When quick exit fires it ends the server session, but the other ways of leaving the page do not reach the server, so the session stays alive until it expires on its own.
**In the demo.** On a running CARE-Y server the control navigates to the safe URL immediately. In the demo the navigation is intercepted so the embedded phone stays on the page, and the data flow panel records the activation instead.`)
};

const es_demo_narrative_client_quick_exit_body = /** @type {(inputs: Demo_Narrative_Client_Quick_Exit_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El control de salida rápida aparece en todas las páginas del cliente, desde el formulario de admisión pasando por el portal y la cuenta hasta los enlaces compartidos. Es un icono sin etiqueta de texto visible, porque la palabra "salir" en pantalla podría llamar la atención en un dispositivo compartido o monitoreado.
**Cómo funciona.** Tocar el control o presionar Escape en cualquier parte de la página ejecuta una secuencia fija. Se borra el título de la pestaña del navegador para que la tira de pestañas no muestre el nombre de la organización, se eliminan de la memoria todas las claves de cifrado, y el navegador navega a un sitio neutral que la organización configura en sus ajustes. La navegación reemplaza la entrada actual del historial para que la página del cliente no aparezca detrás del botón atrás. La tecla Escape tiene prioridad sobre cerrar cualquier panel o hoja abierta, porque el propósito del control es salir rápido y la navegación desmonta la página de todas formas. En la página de cuenta, la salida rápida también finaliza la sesión del servidor para que la cookie no pueda reutilizarse.
**Respaldo.** La salida rápida elimina las claves automáticamente cuando se cierra la pestaña o el visitante navega a otra dirección antes de usar el control. En la página de cuenta un temporizador de inactividad de 15 minutos que avisa a los diez minutos devuelve la vista al formulario de inicio de sesión.
**Compromiso de seguridad.** La cookie de sesión de la página de cuenta tiene una expiración de 24 horas. Cuando se activa la salida rápida se finaliza la sesión del servidor, pero las demás formas de abandonar la página no llegan al servidor, por lo que la sesión permanece activa hasta que expire por sí sola.
**En la demostración.** En un servidor CARE-Y en funcionamiento el control navega al sitio seguro de inmediato. En la demostración se intercepta la navegación para que el teléfono integrado permanezca en la página, y el panel de flujo de datos registra la activación en su lugar.`)
};

/**
* | output |
* | --- |
* | "The quick exit control appears on every client page, from the intake form through the portal and account to share links. It is an icon with no visible text l..." |
*
* @param {Demo_Narrative_Client_Quick_Exit_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_quick_exit_body = /** @type {((inputs?: Demo_Narrative_Client_Quick_Exit_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Quick_Exit_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_quick_exit_body(inputs)
	return en_demo_narrative_client_quick_exit_body(inputs)
});
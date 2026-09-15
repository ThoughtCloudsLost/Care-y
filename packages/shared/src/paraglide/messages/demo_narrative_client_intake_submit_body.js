/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Intake_Submit_BodyInputs */

const en_demo_narrative_client_intake_submit_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Submit_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The server cannot read any of the submitted answers, because the intake form encrypts all field values in the browser and composes a ticket title and description from them before anything leaves the device, after which the server creates the ticket and notifies the destination queue's members.
**Abuse controls.** On a running CARE-Y server, intake submissions are capped at a default of three per address per hour, and the server can require a proof-of-work puzzle the browser solves before the submission is accepted. This handbook runs with proof of work disabled and the rate limiter accepting everything, so nothing in it is ever throttled.
**What the server holds.** The intake submission lands on the server as a sealed content key and encrypted field values the server cannot read. When a field carries a routing role the resolved queue, priority, or escalation value arrives in the clear alongside the ciphertext, and the server uses it for routing without ever seeing the answer that produced it.`)
};

const es_demo_narrative_client_intake_submit_body = /** @type {(inputs: Demo_Narrative_Client_Intake_Submit_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El servidor no puede leer ninguna de las respuestas enviadas, porque el formulario de admisión cifra todos los valores de los campos en el navegador y compone un título y descripción del ticket a partir de ellos antes de que nada salga del dispositivo, después de lo cual el servidor crea el ticket y notifica a los miembros de la cola de destino.
**Controles contra abuso.** En un servidor CARE-Y en funcionamiento, los envíos de admisión están limitados a un valor predeterminado de tres por dirección por hora, y el servidor puede exigir un rompecabezas de prueba de trabajo que el navegador resuelve antes de aceptar el envío. Este manual funciona con la prueba de trabajo desactivada y el limitador de tasa aceptando todo, por lo que nada aquí se ve limitado.
**Lo que guarda el servidor.** El envío de admisión llega al servidor como una clave de contenido sellada y valores de campo cifrados que el servidor no puede leer. Cuando un campo lleva un rol de enrutamiento, el valor resuelto de cola, prioridad o escalamiento llega en claro junto con el texto cifrado, y el servidor lo usa para el enrutamiento sin ver nunca la respuesta que lo produjo.`)
};

/**
* | output |
* | --- |
* | "The server cannot read any of the submitted answers, because the intake form encrypts all field values in the browser and composes a ticket title and descrip..." |
*
* @param {Demo_Narrative_Client_Intake_Submit_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_intake_submit_body = /** @type {((inputs?: Demo_Narrative_Client_Intake_Submit_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Intake_Submit_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_intake_submit_body(inputs)
	return en_demo_narrative_client_intake_submit_body(inputs)
});